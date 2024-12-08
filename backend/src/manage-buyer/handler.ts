import {
  GetCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Request, Response } from "express";
import {
  Bid,
  Item,
  AddFundsResponsePayload,
  ErrorResponsePayload,
} from "../api";
import moment from "moment";

const dclient = new DynamoDBClient({ region: "us-east-1" });
const ADMIN_ROLE = "admin";
const USER_DB = "dev-users3";
export async function placeBid(req: Request, res: Response) {
  const buyerId = res.locals.userId;  // User's unique ID (e.g., 'RIWA81973509')
  const buyerEmail = res.locals.id;   // User's email address, which is the 'id' in DynamoDB
  const { itemId, bidAmount } = req.body;

  const getItemCmd = new GetCommand({
    TableName: "dev-items3",
    Key: { id: itemId },
  });
  const getItemResp = await dclient.send(getItemCmd).catch((err) => {
    res.status(500).send({ status: 500, message: `${err}` });
    return;
  });
  if (!getItemResp) return;
  if (!getItemResp.Item) {
    res.status(404).send({ status: 404, message: "Item not found." });
    return;
  }
  const item = getItemResp.Item as Item;

  if (item.itemState !== "active") {
    res.status(400).send({ status: 400, message: "Item is not active." });
    return;
  }
  const currentDate = new Date();
  const endDate = new Date(item.endDate);
  if (currentDate >= endDate) {
    res
      .status(400)
      .send({ status: 400, message: "Item bidding time has expired." });
    return;
  }

  let currentBidAmount = item.initPrice;
  const transactItems: any[] = [];

  if (item.currentBidId) {
    const getBidCmd = new GetCommand({
      TableName: "dev-bids3",
      Key: { id: item.currentBidId },
    });
    const getBidResp = await dclient.send(getBidCmd).catch((err) => {
      res.status(500).send({ status: 500, message: `${err}` });
      return;
    });
    if (!getBidResp) return;
    if (!getBidResp.Item) {
      res.status(404).send({ status: 404, message: "Current bid not found." });
      return;
    }
    const currentBid = getBidResp.Item as Bid;
    currentBidAmount = currentBid.bidAmount;

    transactItems.push({
      Update: {
        TableName: "dev-bids3",
        Key: { id: currentBid.id },
        UpdateExpression: "SET isActive = :false",
        ExpressionAttributeValues: { ":false": false },
      },
    });
  }

  const minimumBidAmount = currentBidAmount + 1;
  if (bidAmount < minimumBidAmount) {
    res.status(400).send({
      status: 400,
      message: `Bid amount must be at least $${minimumBidAmount}`,
    });
    return;
  }

  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: { id: buyerEmail },
  });
  const getBuyerResp = await dclient.send(getBuyerCmd).catch((err) => {
    res.status(500).send({ status: 500, message: `${err}` });
    return;
  });
  if (!getBuyerResp) return;
  if (!getBuyerResp.Item) {
    res.status(404).send({ status: 404, message: "Buyer not found." });
    return;
  }
  const buyer = getBuyerResp.Item;
  const buyerFunds = buyer.fund ?? 0;

  if (buyerFunds < bidAmount) {
    res
      .status(400)
      .send({ status: 400, message: "Insufficient funds to place the bid." });
    return;
  }

  const bidId = `${buyerId}#${Date.now()}`;
  const bidTime = moment(new Date()).toISOString(true);

  const newBid: Bid = {
    id: bidId,
    bidItemId: itemId,
    bidUserId: buyerEmail,
    bidAmount: bidAmount,
    bidTime: bidTime,
    createAt: Date.now(),
    isActive: true,
  };

  transactItems.push({
    Put: {
      TableName: "dev-bids3",
      Item: newBid,
    },
  });

  transactItems.push({
    Update: {
      TableName: "dev-items3",
      Key: { id: itemId },
      UpdateExpression:
        "SET currentBidId = :bidId, pastBidIds = list_append(if_not_exists(pastBidIds, :empty_list), :bidIdList)",
      ExpressionAttributeValues: {
        ":bidId": bidId,
        ":bidIdList": [bidId],
        ":empty_list": [],
      },
    },
  });

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
        res.status(400).send({
          status: 400,
          message: "Failed to place bid. The item might have a higher bid now.",
        });
      } else {
        res.status(500).send({ status: 500, message: `${err}` });
      }
    });
}

export async function reviewActiveBids(req: Request, res: Response) {
  const buyerId = res.locals.id;

  const scanBidsCmd = new ScanCommand({
    TableName: "dev-bids3",
    FilterExpression: "bidUserId = :buyerId AND isActive = :true",
    ExpressionAttributeValues: {
      ":buyerId": buyerId,
      ":true": true,
    },
  });

  const scanBidsResp = await dclient.send(scanBidsCmd).catch((err) => {
    res.status(500).send({ status: 500, message: `${err}` });
    return;
  });
  if (!scanBidsResp) return;

  const activeBids = scanBidsResp && scanBidsResp.Items ? (scanBidsResp.Items as Bid[]) : [];

  res.status(200).send({
    status: 200,
    message: "Active bids retrieved successfully.",
    payload: activeBids,
  });
}

export async function reviewPurchases(req: Request, res: Response) {
  const buyerEmail = res.locals.id;

  // Fetch the buyer's record from the database
  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: { id: buyerEmail },
  });

  const getBuyerResp = await dclient.send(getBuyerCmd).catch((err) => {
    res.status(500).send({ status: 500, message: `${err}` });
    return;
  });

  if (!getBuyerResp) return;

  if (!getBuyerResp.Item) {
    res.status(404).send({ status: 404, message: "Buyer not found." });
    return;
  }

  const buyer = getBuyerResp.Item;

  // Retrieve the purchases array from the buyer's record
  const purchases = buyer.purchases ?? [];

  // Since fulfillTime is always present, no need to filter
  res.status(200).send({
    status: 200,
    message: "Purchases retrieved successfully.",
    payload: purchases,
  });
}


export async function addFunds(req: Request, res: Response) {
  const buyerEmail = res.locals.id;  // Use email address as the key
  const { amount } = req.body;

  const updateCmd = new UpdateCommand({
    TableName: "dev-users3",
    Key: { id: buyerEmail },
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
        payload: {
          userId: res.locals.userId,
          funds: newFund,
        },
      });
    })
    .catch((err) => {
      res.status(500).send({ status: 500, message: `${err}` });
    });
}
export async function closeAccountHandler(req: Request, res: Response) {
  const buyerEmail = res.locals.id; // User's email address from authentication middleware

  try {
    // Fetch the user's data from the database
    const getUserCommand = new GetCommand({
      TableName: USER_DB,
      Key: { id: buyerEmail },
    });
    const userResult = await dclient.send(getUserCommand);

    if (!userResult.Item) {
      return res.status(404).send({ status: 404, message: "User not found." });
    }
    const scanBidsCmd = new ScanCommand({
      TableName: "dev-bids3",
      FilterExpression: "bidUserId = :buyerId AND isActive = :true",
      ExpressionAttributeValues: {
        ":buyerId": buyerEmail,
        ":true": true,
      },
    });

    const scanBidsResp = await dclient.send(scanBidsCmd).catch((err) => {
      res.status(500).send({ status: 500, message: `${err}` });
      return;
    });

    const activeBids = scanBidsResp && scanBidsResp.Items ? (scanBidsResp.Items as Bid[]) : [];

    if (activeBids.length > 0) {
      return res
        .status(400)
        .send({ status: 400, message: "Could not close account since there are active bids" });
    }

    if (userResult.Item.id !== buyerEmail) {
      return res.status(403).send({
        status: 403,
        message: "You are not authorized to close this account.",
      });
    }

    // Update the user's isActive status to false
    const updateUserCommand = new UpdateCommand({
      TableName: USER_DB,
      Key: { id: buyerEmail },
      UpdateExpression: "SET isActive = :inactive",
      ExpressionAttributeValues: {
        ":inactive": false,
      },
    });

    await dclient.send(updateUserCommand);

    return res
      .status(200)
      .send({ status: 200, message: "Account closed successfully." });
  } catch (error) {
    console.error("Error closing account:", error);
    return res
      .status(500)
      .send({ status: 500, message: "Could not close account." });
  }
}
