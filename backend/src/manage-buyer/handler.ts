import { GetCommand, ScanCommand, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Request, Response } from 'express';
import { Bid, Item, AddFundsResponsePayload, ErrorResponsePayload } from "../api";

const dclient = new DynamoDBClient({ region: "us-east-1" });

export async function addFunds(req: Request, res: Response) {
  const buyerId = res.locals.userId; // Ensure this is the user's 'id' from DynamoDB
  const { amount } = req.body;

  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    res.status(400).send({ status: 400, message: "Invalid amount." });
    return;
  }

  // Get the buyer's record to ensure the user exists
  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: { id: buyerId },
  });

  const getBuyerResp = await dclient.send(getBuyerCmd).catch((err) => {
    res.status(500).send({ status: 500, message: `${err}` });
    return;
  });

  if (!getBuyerResp || !getBuyerResp.Item) {
    res.status(404).send({ status: 404, message: "Buyer not found." });
    return;
  }

  // Proceed to update the fund
  const updateCmd = new UpdateCommand({
    TableName: "dev-users3",
    Key: { id: buyerId },
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
          userId: buyerId,
          funds: newFund,
        },
      });
    })
    .catch((err) => {
      res.status(500).send({ status: 500, message: `${err}` });
    });
}

export async function placeBid(req: Request, res: Response) {
  const buyerId = res.locals.userId; // Ensure this is the user's 'id' from DynamoDB
  const { itemId, bidAmount } = req.body;

  // Validate bidAmount
  if (typeof bidAmount !== 'number' || bidAmount <= 0) {
    res.status(400).send({ status: 400, message: "Invalid bid amount." });
    return;
  }

  // Get the buyer's record
  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: { id: buyerId },
  });
  const getBuyerResp = await dclient.send(getBuyerCmd).catch((err) => {
    res.status(500).send({ status: 500, message: `${err}` });
    return;
  });
  if (!getBuyerResp || !getBuyerResp.Item) {
    res.status(404).send({ status: 404, message: "Buyer not found." });
    return;
  }
  const buyer = getBuyerResp.Item;
  const buyerFunds = buyer.fund ?? 0;

  // Rest of your existing placeBid logic...
  // Ensure to check buyerFunds and proceed accordingly
}

export async function reviewActiveBids(req: Request, res: Response) {
  const buyerId = res.locals.userId; // Ensure this is the user's 'id' from DynamoDB

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
    res.status(500).send({ status: 500, message: `${err}` });
    return;
  });
  if (!scanBidsResp) return;

  const activeBids = (scanBidsResp.Items as Bid[]) || [];

  res.status(200).send({
    status: 200,
    message: "Active bids retrieved successfully.",
    payload: activeBids,
  });
}

export async function reviewPurchases(req: Request, res: Response) {
  const buyerId = res.locals.userId; // Ensure this is the user's 'id' from DynamoDB

  const getBuyerCmd = new GetCommand({
    TableName: "dev-users3",
    Key: { id: buyerId },
  });
  const getBuyerResp = await dclient.send(getBuyerCmd).catch((err) => {
    res.status(500).send({ status: 500, message: `${err}` });
    return;
  });
  if (!getBuyerResp || !getBuyerResp.Item) {
    res.status(404).send({ status: 404, message: "Buyer not found." });
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
