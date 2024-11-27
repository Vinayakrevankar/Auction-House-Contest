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

export async function fulfillItem(
  sellerId: string,
  itemId: string,
  res: Response
) {
  const sellerEmail = res.locals.id;
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
      message: "Item not found.",
    });
    return;
  }

  const item = queryItemResp.Items[0] as Item;
  if (item.itemState !== "completed" || item.currentBidId === undefined) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "This item cannot be fulfilled yet.",
    });
    return;
  }

  const getBidCmd = new GetCommand({
    TableName: "dev-bids3",
    Key: {
      id: item.currentBidId,
    },
  });
  const getBidResp = await dclient.send(getBidCmd).catch((err) => {
    res.status(500).send({ error: err });
  });
  if (!getBidResp) {
    return;
  } else if (getBidResp.Item === undefined) {
    res.status(404).send(<ErrorResponsePayload>{
      status: 404,
      message: "Bid not found.",
    });
    return;
  }
  const bid = getBidResp.Item as Bid;

  const getBidderCmd = new GetCommand({
    TableName: "dev-users3",
    Key: {
      id: sellerEmail,
    },
  });

  const getBidderResp = await dclient.send(getBidderCmd).catch((err) => {
    res
      .status(500)
      .send({ error: "Failed to fetch bidder data", message: err.message });
    return;
  });

  if (!getBidderResp || !getBidderResp.Item) {
    res.status(404).send({ error: "Bidder not found" });
    return;
  }

  const bidder = getBidderResp.Item as { fund: number }; // Assuming fund is a number in the bidder's item
  if (!bidder.fund || bidder.fund < bid.bidAmount) {
    res.status(400).send({ error: "Bidder has insufficient funds." });
    return;
  }
  let fund = bidder.fund - bid.bidAmount;
  const updateBidderCmd = await dclient.send(
    new UpdateCommand({
      TableName: "dev-users3",
      Key: {
        id: bid.bidUserId,
      },
      UpdateExpression:
        "set fund = :amount, purchases = list_append(if_not_exists(purchases, :empty_list), :new_purchase)",
      ExpressionAttributeValues: {
        ":amount": fund,
        ":empty_list": [],
        ":new_purchase": [
          {
            itemId: item.id,
            itemName: item.name,
            price: bid.bidAmount,
            soldTime: bid.bidTime,
            fulfillTime: new Date().toISOString(),
          },
        ],
      },
    })
  );
  const updateSellerCmd = await dclient.send(
    new UpdateCommand({
      TableName: "dev-users3",
      Key: {
        id: sellerEmail,
      },
      UpdateExpression: "set fund = if_not_exists(fund, :zero) + :amount",
      ExpressionAttributeValues: {
        ":zero": 0,
        ":amount": bid.bidAmount,
      },
    })
  );
  const updateItemCmd = await dclient.send(
    new UpdateCommand({
      TableName: "dev-items3",
      Key: {
        id: item.id,
      },
      UpdateExpression:
        "set soldBidId = :id, soldTime = :time, itemState = :newState",
      ExpressionAttributeValues: {
        ":id": bid.id,
        ":time": bid.bidTime,
        ":newState": "archived",
      },
    })
  );

  res.status(200).send({
    status: 200,
    message: "Item fulfill success.",
    payload: <ItemFulfillResponsePayload>{
      itemId: item.id,
      soldBid: bid,
      soldTime: bid.bidTime,
    },
  });
  // const batchUpdateTransactionCmd = new TransactWriteCommand({
  //   TransactItems: [
  //     {
  //       Update: {
  //         TableName: "dev-users3",
  //         Key: {
  //           "id": bid.bidUserId,
  //         },
  //         UpdateExpression: "set fund = if_not_exists(fund, :zero) - :amount, purchases = list_append(if_not_exists(purchases, :empty_list), :new_purchase)",
  //         ConditionExpression: "fund >= :amount",
  //         ExpressionAttributeValues: {
  //           ":amount": bid.bidAmount,
  //           ":zero": 0,
  //           ":empty_list": [],
  //           ":new_purchase": <Purchase[]>[{
  //             itemId: item.id,
  //             itemName: item.name,
  //             price: bid.bidAmount,
  //             soldTime: bid.bidTime,
  //             fulfillTime: new Date().toISOString(),
  //           }],
  //         },
  //       }
  //     },
  //     {
  //       Update: {
  //         TableName: "dev-users3",
  //         Key: {
  //           "id": sellerId,
  //         },
  //         UpdateExpression: "set fund = if_not_exists(fund, :zero) + :amount",
  //         ExpressionAttributeValues: {
  //           ":zero": 0,
  //           ":amount": bid.bidAmount,
  //         },
  //       }
  //     },
  //     {
  //       Update: {
  //         TableName: "dev-items3",
  //         Key: {
  //           "id": item.id,
  //         },
  //         UpdateExpression: "set soldBidId = :id, soldTime = :time, itemState = :newState",
  //         ExpressionAttributeValues: {
  //           ":id": bid.id,
  //           ":time": bid.bidTime,
  //           ":newState": "archived"
  //         },
  //       },
  //     },
  //   ],
  // });
  // const batchUpdateTransactionResp = dclient.send(batchUpdateTransactionCmd)
  // .catch(err => {
  //   res.status(500).send({ error: err });
  // }).then(resp => {
  //   console.log("resp", resp);
  //   res.status(200).send({
  //     status: 200,
  //     message: "Item fulfill success.",
  //     payload: <ItemFulfillResponsePayload>{
  //       itemId: item.id,
  //       soldBid: bid,
  //       soldTime: bid.bidTime,
  //     },
  //   });
  // });
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
