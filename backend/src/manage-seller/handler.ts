import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Response } from "express";
import {
  Bid,
  Item,
  Purchase,
  PlainSuccessResponsePayload,
  ErrorResponsePayload,
  ItemFulfillResponsePayload,
} from "../api";
import { ADMIN_ID } from "../constants";
const dclient = new DynamoDBClient({ region: "us-east-1" });

export function archiveItem(sellerId: string, itemId: string, res: Response) {
  const cmd = new UpdateCommand({
    TableName: "dev-items3",
    Key: {
      id: itemId,
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
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: `${err}`,
      });
    } else {
      res.status(200).send(<PlainSuccessResponsePayload>{
        status: 200,
        message: "Item archive success.",
      });
    }
  });
}

export async function fulfillItem(sellerId: string, itemId: string, res: Response) {
  const seller_table_id = res.locals.id;
  const queryItemCmd = new QueryCommand({
    TableName: "dev-items3",
    KeyConditionExpression: "id = :id",
    FilterExpression: "sellerId = :sid",
    ExpressionAttributeValues: {
      ":id": itemId,
      ":sid": sellerId,
    },
  });
  const queryItemResp = await dclient.send(queryItemCmd).catch(err => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: `${err}`,
    });
  });
  if (!queryItemResp) {
    return;
  } else if (queryItemResp.Items?.at(0) === undefined) {
    res.status(404).send(<ErrorResponsePayload>{
      status: 404,
      message: "Item not found."
    });
    return;
  }

  const item = queryItemResp.Items[0] as Item;
  if (item.itemState !== "completed" || item.currentBidId === undefined) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "This item cannot be fulfilled yet."
    });
    return;
  }

  const getBidCmd = new GetCommand({
    TableName: "dev-bids3",
    Key: {
      "id": item.currentBidId,
    },
  });
  const getBidResp = await dclient.send(getBidCmd).catch(err => {
    res.status(500).send({ error: err });
  });
  if (!getBidResp) {
    return;
  } else if (getBidResp.Item === undefined) {
    res.status(404).send(<ErrorResponsePayload>{
      status: 404,
      message: "Bid not found."
    });
    return;
  }
  const bid = getBidResp.Item as Bid;

  const batchUpdateTransactionCmd = new TransactWriteCommand({
    TransactItems: [
      {
        Update: {
          TableName: "dev-users3",
          Key: {
            "id": bid.bidUserId,
          },
          UpdateExpression: "set fund = fund - :amount, purchases = list_append(if_not_exists(purchases, :empty), :new_purchase)",
          ConditionExpression: "fund >= :amount",
          ExpressionAttributeValues: {
            ":amount": bid.bidAmount,
            ":new_purchase": <Purchase[]>[{
              itemId: item.id,
              itemName: item.name,
              price: bid.bidAmount,
              soldTime: bid.bidTime,
              fulfillTime: new Date().toISOString(),
            }],
            ":empty": [],
          },
        }
      },
      {
        Update: {
          TableName: "dev-users3",
          Key: {
            "id": seller_table_id,
          },
          UpdateExpression: "set fund = if_not_exists(fund, :zero) + :amount",
          ExpressionAttributeValues: {
            ":amount": bid.bidAmount,
            ":zero": 0,
          },
        }
      },
      {
        Update: {
          TableName: "dev-items3",
          Key: {
            "id": item.id,
          },
          UpdateExpression: "set soldBidId = :id, soldTime = :time, itemState = :new_state",
          ExpressionAttributeValues: {
            ":id": bid.id,
            ":time": bid.bidTime,
            ":new_state": "archived",
          },
        },
      },
      {
        Update: {
          TableName: "dev-bids3",
          Key: {
            "id": bid.id,
          },
          UpdateExpression: "set isActive = :inactive",
          ExpressionAttributeValues: {
            ":inactive": false,
          },
        },
      },
    ],
  });
  const batchUpdateTransactionResp = dclient.send(batchUpdateTransactionCmd).catch(err => {
    res.status(500).send({ error: err });
  });
  if (!batchUpdateTransactionResp) {
    return;
  }
  res.status(200).send({
    status: 200,
    message: "Item fulfill success.",
    payload: <ItemFulfillResponsePayload>{
      itemId: item.id,
      soldBid: bid,
      soldTime: bid.bidTime,
    },
  });
}

export async function requestUnfreezeItem(
  sellerId: string,
  itemId: string,
  res: Response
) {
  const queryItemCmd = new QueryCommand({
    TableName: "dev-items3",
    KeyConditionExpression: "id = :id",
    FilterExpression: "sellerId = :sid",
    ExpressionAttributeValues: {
      ":id": itemId,
      ":sid": sellerId,
    },
  });
  const queryItemResp = await dclient.send(queryItemCmd).catch((err) => {
    res.status(500).send({ error: err });
  });
  if (!queryItemResp) {
    return;
  } else if (queryItemResp.Items?.at(0) === undefined) {
    res.status(404).send({ error: "Item not found." });
    return;
  }

  const item = queryItemResp.Items[0] as Item;
  if (!item.isFrozen) {
    res.status(400).send({ error: "Item is not frozen." });
    return;
  }

  const updateAdminCmd = new UpdateCommand({
    TableName: "dev-users3",
    Key: {
      id: ADMIN_ID,
    },
    UpdateExpression:
      "set itemUnfreezeRequests = list_append(itemUnfreezeRequests, :req)",
    ConditionExpression: "attribute_exists(itemUnfreezeRequests)",
    ExpressionAttributeValues: {
      ":req": [item.id],
    },
  });
  dclient.send(updateAdminCmd, (err, _) => {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      res.status(200).send(<PlainSuccessResponsePayload>{
        status: 200,
        message: "Success",
      });
    }
  });
}
