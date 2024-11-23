import { GetCommand, QueryCommand, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Response } from 'express';
import { Bid, Item, Purchase, PlainSuccessResponsePayload, ErrorResponsePayload, AddFundsResponsePayload } from "../api";

const dclient = new DynamoDBClient({ region: "us-east-1" });

export async function placeBid(buyerId: string, itemId: string, bidAmount: number, res: Response) {
  // Step 1: Get the item
  const getItemCmd = new GetCommand({
    TableName: "dev-items3",
    Key: {
      "id": itemId,
    },
  });
  const getItemResp = await dclient.send(getItemCmd).catch(err => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: `${err}`,
    });
    return;
  });
  if (!getItemResp) {
    return;
  } else if (getItemResp.Item === undefined) {
    res.status(404).send(<ErrorResponsePayload>{
      status: 404,
      message: "Item not found."
    });
    return;
  }
  const item = getItemResp.Item as Item;

  // Step 2: Check item is active and not expired
  if (item.itemState !== "active") {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "Item is not active."
    });
    return;
  }
  const currentDate = new Date();
  const endDate = new Date(item.endDate);
  if (currentDate >= endDate) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "Item bidding time has expired."
    });
    return;
  }

  // Step 3: Get current highest bid
  let currentBidAmount = item.initPrice;
  if (item.currentBidId) {
    const getBidCmd = new GetCommand({
      TableName: "dev-bids3",
      Key: {
        "id": item.currentBidId,
      },
    });
    const getBidResp = await dclient.send(getBidCmd).catch(err => {
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: `${err}`,
      });
      return;
    });
    if (!getBidResp) {
      return;
    } else if (getBidResp.Item === undefined) {
      res.status(404).send(<ErrorResponsePayload>{
        status: 404,
        message: "Current bid not found."
      });
      return;
    }
    const currentBid = getBidResp.Item as Bid;
    currentBidAmount = currentBid.bidAmount;
  }

  // Step 4: Check bidAmount is valid
  const minimumBidAmount = currentBidAmount + 1;
  if (bidAmount < minimumBidAmount) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: `Bid amount must be at least $${minimumBidAmount}`
    });
    return;
  }

  // Step 5: Get buyer's funds
  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: {
      "id": buyerId,
    },
  });
  const getBuyerResp = await dclient.send(getBuyerCmd).catch(err => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: `${err}`,
    });
    return;
  });
  if (!getBuyerResp) {
    return;
  } else if (getBuyerResp.Item === undefined) {
    res.status(404).send(<ErrorResponsePayload>{
      status: 404,
      message: "Buyer not found."
    });
    return;
  }
  const buyer = getBuyerResp.Item;
  const buyerFunds = buyer.fund ?? 0;

  // Step 6: Ensure buyer has sufficient funds
  if (buyerFunds < bidAmount) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "Insufficient funds to place the bid."
    });
    return;
  }

  // Step 7: Create new bid and update item
  const bidId = `${buyerId}#${Date.now()}`; // Updated bid ID format
  const bidTime = new Date().toISOString();

  const newBid: Bid = {
    id: bidId,
    bidItemId: itemId,
    bidUserId: buyerId,
    bidAmount: bidAmount,
    bidTime: bidTime,
    createAt: Date.now(),
  };

  const transactParams = {
    TransactItems: [
      {
        Put: {
          TableName: "dev-bids3",
          Item: newBid,
        },
      },
      {
        Update: {
          TableName: "dev-items3",
          Key: {
            "id": itemId,
          },
          UpdateExpression: "SET currentBidId = :bidId, pastBidIds = list_append(if_not_exists(pastBidIds, :empty_list), :bidIdList)",
          ConditionExpression: "currentBidId = :oldBidId OR attribute_not_exists(currentBidId)",
          ExpressionAttributeValues: {
            ":bidId": bidId,
            ":bidIdList": [bidId],
            ":empty_list": [],
            ":oldBidId": item.currentBidId ?? null,
          },
        },
      },
    ],
  };

  const transactCmd = new TransactWriteCommand(transactParams);

  await dclient.send(transactCmd).then(() => {
    res.status(202).send({
      status: 202,
      message: "Bid placed successfully.",
      payload: newBid,
    });
  }).catch(err => {
    if (err.name === "TransactionCanceledException") {
      res.status(400).send(<ErrorResponsePayload>{
        status: 400,
        message: "Failed to place bid. The item might have a higher bid now."
      });
    } else {
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: `${err}`,
      });
    }
  });
}

export async function reviewActiveBids(buyerId: string, res: Response) {
  const queryBidsCmd = new QueryCommand({
    TableName: "dev-bids3",
    IndexName: "bidUserId-index", // Ensure this GSI exists
    KeyConditionExpression: "bidUserId = :buyerId",
    ExpressionAttributeValues: {
      ":buyerId": buyerId,
    },
  });
  const queryBidsResp = await dclient.send(queryBidsCmd).catch(err => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: `${err}`,
    });
    return;
  });
  if (!queryBidsResp) {
    return;
  }
  const bids = queryBidsResp.Items as Bid[];

  const activeBids: Bid[] = [];
  for (const bid of bids) {
    const getItemCmd = new GetCommand({
      TableName: "dev-items3",
      Key: {
        "id": bid.bidItemId,
      },
    });
    const getItemResp = await dclient.send(getItemCmd).catch(err => {
      console.error(`Error getting item ${bid.bidItemId}: ${err}`);
      return;
    });
    if (!getItemResp || !getItemResp.Item) {
      continue;
    }
    const item = getItemResp.Item as Item;
    if (item.itemState !== "active") {
      continue;
    }
    if (item.currentBidId === bid.id) {
      activeBids.push(bid);
    }
  }

  res.status(200).send({
    status: 200,
    message: "Active bids retrieved successfully.",
    payload: activeBids,
  });
}

export async function reviewPurchases(buyerId: string, res: Response) {
  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: {
      "id": buyerId,
    },
  });
  const getBuyerResp = await dclient.send(getBuyerCmd).catch(err => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: `${err}`,
    });
    return;
  });
  if (!getBuyerResp) {
    return;
  } else if (getBuyerResp.Item === undefined) {
    res.status(404).send(<ErrorResponsePayload>{
      status: 404,
      message: "Buyer not found."
    });
    return;
  }
  const buyer = getBuyerResp.Item;
  const purchases = buyer.purchases ?? [];

  res.status(200).send({
    status: 200,
    message: "Purchases retrieved successfully.",
    payload: purchases,
  });
}

export async function addFunds(buyerId: string, amount: number, res: Response) {
  const updateCmd = new UpdateCommand({
    TableName: "dev-users3",
    Key: {
      "id": buyerId,
    },
    UpdateExpression: "SET fund = if_not_exists(fund, :zero) + :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":zero": 0,
    },
    ReturnValues: "UPDATED_NEW",
  });

  await dclient.send(updateCmd).then(data => {
    const newFund = data.Attributes?.fund;
    res.status(200).send({
      status: 200,
      message: "Funds added successfully.",
      payload: <AddFundsResponsePayload>{
        userId: buyerId,
        funds: newFund,
      },
    });
  }).catch(err => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: `${err}`,
    });
  });
}
