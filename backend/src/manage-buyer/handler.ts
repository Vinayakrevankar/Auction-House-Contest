import { GetCommand, ScanCommand, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Request, Response } from 'express';
import { Bid, Item, Purchase, PlainSuccessResponsePayload, ErrorResponsePayload, AddFundsResponsePayload } from "../api";
import { v4 as uuidv4 } from 'uuid';

const dclient = new DynamoDBClient({ region: "us-east-1" });

export async function placeBid(req: Request, res: Response) {
  const buyerId = res.locals.userId; // Use userId from res.locals
  const { itemId, bidAmount } = req.body;

  // Step 1: Get the item
  const getItemCmd = new GetCommand({
    TableName: "dev-items3",
    Key: {
      id: itemId,
    },
  });
  const getItemResp = await dclient.send(getItemCmd).catch((err) => {
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
      message: "Item not found.",
    });
    return;
  }
  const item = getItemResp.Item as Item;

  // Step 2: Check item is active and not expired
  if (item.itemState !== "active") {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "Item is not active.",
    });
    return;
  }
  const currentDate = new Date();
  const endDate = new Date(item.endDate);
  if (currentDate >= endDate) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "Item bidding time has expired.",
    });
    return;
  }

  // Step 3: Get current highest bid amount
  let currentBidAmount = item.initPrice;

  // Prepare transaction items
  const transactItems: any[] = [];

  // If currentBidId exists, deactivate the current bid
  if (item.currentBidId) {
    const getBidCmd = new GetCommand({
      TableName: "dev-bids3",
      Key: {
        id: item.currentBidId,
      },
    });
    const getBidResp = await dclient.send(getBidCmd).catch((err) => {
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
        message: "Current bid not found.",
      });
      return;
    }
    const currentBid = getBidResp.Item as Bid;
    currentBidAmount = currentBid.bidAmount;

    // Deactivate the current bid
    transactItems.push({
      Update: {
        TableName: "dev-bids3",
        Key: {
          id: currentBid.id,
        },
        UpdateExpression: "SET isActive = :false",
        ExpressionAttributeValues: {
          ":false": false,
        },
      },
    });
  }

  // Step 4: Check bidAmount is valid
  const minimumBidAmount = currentBidAmount + 1;
  if (bidAmount < minimumBidAmount) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: `Bid amount must be at least $${minimumBidAmount}`,
    });
    return;
  }

  // Step 5: Get buyer's funds
  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: {
      id: buyerId,
    },
  });
  const getBuyerResp = await dclient.send(getBuyerCmd).catch((err) => {
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
      message: "Buyer not found.",
    });
    return;
  }
  const buyer = getBuyerResp.Item;
  const buyerFunds = buyer.fund ?? 0;

  // Step 6: Ensure buyer has sufficient funds
  if (buyerFunds < bidAmount) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "Insufficient funds to place the bid.",
    });
    return;
  }

  // Step 7: Create new bid and update item
  const bidId = uuidv4(); // Generate a UUID for bid ID
  const bidTime = new Date().toISOString();

  const newBid: Bid = {
    id: bidId,
    bidItemId: itemId,
    bidUserId: buyerId,
    bidAmount: bidAmount,
    bidTime: bidTime,
    createAt: Date.now(),
    isActive: true, // Set isActive to true
  };

  // Add the new bid to the transaction
  transactItems.push({
    Put: {
      TableName: "dev-bids3",
      Item: newBid,
    },
  });

  // Update the item to set currentBidId to the new bid ID
  transactItems.push({
    Update: {
      TableName: "dev-items3",
      Key: {
        id: itemId,
      },
      UpdateExpression:
        "SET currentBidId = :bidId, pastBidIds = list_append(if_not_exists(pastBidIds, :empty_list), :bidIdList)",
      ExpressionAttributeValues: {
        ":bidId": bidId,
        ":bidIdList": [bidId],
        ":empty_list": [],
      },
    },
  });

  // Prepare the transaction
  const transactCmd = new TransactWriteCommand({
    TransactItems: transactItems,
  });

  await dclient
    .send(transactCmd)
    .then(() => {
      res.status(202).send({
        status: 202,
        message: "Bid placed successfully.",
        payload: newBid,
      });
    })
    .catch((err) => {
      if (err.name === "TransactionCanceledException") {
        res.status(400).send(<ErrorResponsePayload>{
          status: 400,
          message: "Failed to place bid. The item might have a higher bid now.",
        });
      } else {
        res.status(500).send(<ErrorResponsePayload>{
          status: 500,
          message: `${err}`,
        });
      }
    });
}

export async function reviewActiveBids(req: Request, res: Response) {
  const buyerId = res.locals.userId;

  // Use ScanCommand to get all bids where bidUserId = buyerId and isActive = true
  const scanBidsCmd = new ScanCommand({
    TableName: "dev-bids3",
    FilterExpression: "bidUserId = :buyerId AND isActive = :true",
    ExpressionAttributeValues: {
      ":buyerId": buyerId,
      ":true": true,
    },
  });

  const scanBidsResp = await dclient.send(scanBidsCmd).catch((err) => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: `${err}`,
    });
    return;
  });
  if (!scanBidsResp) {
    return;
  }

  const activeBids = scanBidsResp.Items as Bid[] || [];

  res.status(200).send({
    status: 200,
    message: "Active bids retrieved successfully.",
    payload: activeBids,
  });
}

export async function reviewPurchases(req: Request, res: Response) {
  const buyerId = res.locals.userId;

  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: {
      id: buyerId,
    },
  });
  const getBuyerResp = await dclient.send(getBuyerCmd).catch((err) => {
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
      message: "Buyer not found.",
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

export async function addFunds(req: Request, res: Response) {
  const buyerId = res.locals.userId;
  const { amount } = req.body;

  const updateCmd = new UpdateCommand({
    TableName: "dev-users3",
    Key: {
      id: buyerId,
    },
    UpdateExpression: "SET fund = if_not_exists(fund, :zero) + :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":zero": 0,
    },
    ReturnValues: "UPDATED_NEW",
  });

  await dclient
    .send(updateCmd)
    .then((data) => {
      const newFund = data.Attributes?.fund;
      res.status(200).send({
        status: 200,
        message: "Funds added successfully.",
        payload: <AddFundsResponsePayload>{
          userId: buyerId,
          funds: newFund,
        },
      });
    })
    .catch((err) => {
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: `${err}`,
      });
    });
}
