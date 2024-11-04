import { GetCommand, QueryCommand, TransactWriteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Response } from 'express';
import { Bid, Item } from "../api";

const dclient = new DynamoDBClient({ region: "us-east-1" });

export function archiveItem(sellerId: string, itemId: string, res: Response<any, Record<string, any>>) {
  let cmd = new UpdateCommand({
    TableName: "dev-items1",
    Key: {
      "id": itemId,
    },
    UpdateExpression: "SET itemState = :new",
    ConditionExpression: "itemState = :old AND sellerId = :sid",
    ExpressionAttributeValues: {
      ":new": "archived",
      ":old": "inactive",
      ":sid": sellerId,
    },
  });
  dclient.send(cmd, (err, _) => {
    if (err) {
      res.status(500).send({
        error: err,
      });
    } else {
      res.send({
        message: "Success",
        itemId: itemId,
        itemState: "archived",
      });
    }
  });
}

export async function fulfillItem(sellerId: string, itemId: string, res: Response<any, Record<string, any>>) {
  let queryItemCmd = new QueryCommand({
    TableName: "dev-items1",
    KeyConditionExpression: "id = :id",
    FilterExpression: "sellerId = :sid",
    ExpressionAttributeValues: {
      ":id": itemId,
      ":sid": sellerId,
    },
  });
  let queryItemResp = await dclient.send(queryItemCmd).catch(err => {
    res.status(500).send({
      error: err,
    });
  });
  if (!queryItemResp) {
    return;
  } else if ((queryItemResp.Count ?? 0) === 0) {
    res.status(404).send({
      error: "Item not found.",
    });
    return;
  }

  let item = queryItemResp.Items![0] as Item;
  if (item.itemState !== "completed" || item.currentBidId === undefined) {
    res.status(400).send({
      error: "This item cannot be fulfilled yet.",
    });
    return;
  }

  let queryBidCmd = new QueryCommand({
    TableName: "dev-bids1",
    KeyConditionExpression: "id = :id",
    ExpressionAttributeValues: {
      ":id": item.currentBidId,
    },
  });
  let queryBidResp = await dclient.send(queryBidCmd).catch(err => {
    res.status(500).send({
      error: err,
    });
  });
  if (!queryBidResp) {
    return;
  } else if ((queryBidResp.Count ?? 0) === 0) {
    res.status(404).send({
      error: "Bid not found.",
    });
    return;
  }
  let bid = queryBidResp.Items![0] as Bid;

  let batchUpdateTransactionCmd = new TransactWriteCommand({
    TransactItems: [
      {
        Update: {
          TableName: "dev-users1",
          Key: {
            "id": bid.bidUserId,
          },
          UpdateExpression: "set funds = funds - :amount",
          ConditionExpression: "funds >= :amount",
          ExpressionAttributeValues: {
            ":amount": bid.bidAmount,
          },
        }
      },
      {
        Update: {
          TableName: "dev-users1",
          Key: {
            "id": sellerId,
          },
          UpdateExpression: "set funds = funds + :amount",
          ExpressionAttributeValues: {
            ":amount": bid.bidAmount,
          },
        }
      },
    ],
  });
  let batchUpdateTransactionResp = dclient.send(batchUpdateTransactionCmd).catch(err => {
    res.status(500).send({
      error: err,
    });
  });
  if (!batchUpdateTransactionResp) {
    return;
  }
  res.send({
    message: "Finished fulfill item.",
    soldBid: bid,
    soldTime: new Date().toISOString(),
  });
}
