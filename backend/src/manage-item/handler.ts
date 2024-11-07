import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, UpdateCommand, DeleteCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TABLE_NAMES } from "./constants";
import { Item, ItemDetails, ItemPublishResponse, ItemStateResponse } from "../api";

const dclient = new DynamoDBClient({ region: "us-east-1" });

export async function addItem(
  sellerId: string,
  itemData: any,
  res: Response<any, Record<string, any>>
) {
  // Validate input data according to AddItemRequest schema
  const requiredFields = ['name', 'description', 'initPrice', 'lengthOfAuction', 'images'];
  for (const field of requiredFields) {
    if (!itemData[field]) {
      res.status(400).send({ error: `${field} is required` });
      return;
    }
  }

  if (itemData.initPrice < 1) {
    res.status(400).send({ error: "initPrice must be at least $1" });
    return;
  }

  if (!Array.isArray(itemData.images) || itemData.images.length === 0) {
    res.status(400).send({ error: "At least one image is required" });
    return;
  }

  const itemId = uuidv4();
  const createAt = Date.now();

  // Calculate startDate and endDate based on lengthOfAuction
  const startDate = new Date().toISOString(); // Auction starts now
  const endDate = new Date(Date.now() + itemData.lengthOfAuction * 24 * 60 * 60 * 1000).toISOString();

  const item = {
    id: itemId,
    sellerId: sellerId,
    name: itemData.name,
    description: itemData.description,
    images: itemData.images,
    initPrice: itemData.initPrice,
    lengthOfAuction: itemData.lengthOfAuction,
    startDate: startDate,
    endDate: endDate,
    itemState: "inactive", // Initial state is inactive
    isFrozen: false,
    createAt: createAt,
    updateAt: createAt,
    // Initialize optional fields
    currentBidId: null,
    pastBidIds: [],
    soldTime: null,
    soldBidId: null,
  };

  const cmd = new PutCommand({
    TableName: "dev-items3",
    Item: item,
  });

  try {
    await dclient.send(cmd);
    res.status(201).send({
      message: "Item added successfully",
      item: item,
    });
  } catch (err) {
    res.status(500).send({ error: err });
  }
}
export async function editItem(
  sellerId: string,
  itemId: string,
  itemData: any,
  res: Response<any, Record<string, any>>
) {
  // Fetch the item to verify ownership and state
  const getCmd = new GetCommand({
    TableName: "dev-items3",
    Key: { id: itemId },
  });

  try {
    const result = await dclient.send(getCmd);
    const item = result.Item;

    if (!item) {
      res.status(404).send({ error: "Item not found" });
      return;
    }

    if (item.sellerId !== sellerId) {
      res.status(403).send({ error: "You can only edit your own items" });
      return;
    }

    if (item.itemState !== "inactive") {
      res.status(403).send({ error: "Only inactive items can be edited" });
      return;
    }

    // Prepare the update expression and attribute values
    let updateExpression = "SET updateAt = :updateAt";
    const expressionAttributeValues: any = { ":updateAt": Date.now() };
    const expressionAttributeNames: any = {};

    if (itemData.name) {
      updateExpression += ", #name = :name";
      expressionAttributeValues[":name"] = itemData.name;
      expressionAttributeNames["#name"] = "name";
    }

    if (itemData.description) {
      updateExpression += ", description = :description";
      expressionAttributeValues[":description"] = itemData.description;
    }

    if (itemData.images) {
      if (!Array.isArray(itemData.images) || itemData.images.length === 0) {
        res.status(400).send({ error: "At least one image is required" });
        return;
      }
      updateExpression += ", images = :images";
      expressionAttributeValues[":images"] = itemData.images;
    }

    if (itemData.initPrice) {
      if (itemData.initPrice < 1) {
        res.status(400).send({ error: "initPrice must be at least $1" });
        return;
      }
      updateExpression += ", initPrice = :initPrice";
      expressionAttributeValues[":initPrice"] = itemData.initPrice;
    }

    const updateCmd = new UpdateCommand({
      TableName: "dev-items3",
      Key: { id: itemId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length ? expressionAttributeNames : undefined,
    });

    await dclient.send(updateCmd);

    res.send({
      message: "Item updated successfully",
      itemId: itemId,
    });
  } catch (err) {
    res.status(500).send({ error: err });
  }
}

export async function removeInactiveItem(
  sellerId: string,
  itemId: string,
  res: Response<any, Record<string, any>>
) {
  // Fetch the item to verify ownership and state
  const getCmd = new GetCommand({
    TableName: "dev-items3",
    Key: { id: itemId },
  });

  try {
    const result = await dclient.send(getCmd);
    const item = result.Item;

    if (!item) {
      res.status(404).send({ error: "Item not found" });
      return;
    }

    if (item.sellerId !== sellerId) {
      res.status(403).send({ error: "You can only remove your own items" });
      return;
    }

    if (item.itemState !== "inactive") {
      res.status(403).send({ error: "Only inactive items can be removed" });
      return;
    }

    // Delete the item
    const deleteCmd = new DeleteCommand({
      TableName: "dev-items3",
      Key: { id: itemId },
    });

    await dclient.send(deleteCmd);

    res.send({
      message: "Item removed successfully",
      itemId: itemId,
    });
  } catch (err) {
    res.status(500).send({ error: err });
  }
}


//Publish item
export function publishItem(sellerId: string, itemId: string, startDate: string, endDate: string, res: Response) {
  let cmd = new UpdateCommand({
    TableName: TABLE_NAMES.ITEMS,
    Key: {
      "id": itemId,
    },
    UpdateExpression: "SET itemState = :new, startDate = :sd, endDate = :ed",
    ConditionExpression: "itemState = :old AND sellerId = :sid",
    ExpressionAttributeValues: {
      ":new": "active",
      ":sd": startDate,
      ":ed": endDate,
      ":old": "inactive",
      ":sid": sellerId,
    },
  });
  dclient.send(cmd, (err, _) => {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      res.send(<ItemPublishResponse>{
        message: "Success",
        itemId: itemId,
        itemState: "active",
        startDate: startDate,
        endDate: endDate,
      });
    }
  });
}
//Unpublish item
export function unpublishItem(sellerId: string, itemId: string, res: Response) {
  let cmd = new UpdateCommand({
    TableName: TABLE_NAMES.ITEMS,
    Key: {
      "id": itemId,
    },
    UpdateExpression: "SET itemState = :new",
    ConditionExpression: "itemState = :old AND sellerId = :sid AND currentBidId = null",
    ExpressionAttributeValues: {
      ":new": "inactive",
      ":old": "active",
      ":sid": sellerId,
    },
  });
  dclient.send(cmd, (err, _) => {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      res.send(<ItemStateResponse>{
        message: "Success",
        itemId: itemId,
        itemState: "inactive",
      });
    }
  });
}

//Review item
export function reviewItems(
  sellerId: string,
  res: Response
) {
  const scanCmd = new ScanCommand({
    TableName: TABLE_NAMES.ITEMS,
    FilterExpression: "sellerId = :sid",
    ExpressionAttributeValues: {
      ":sid": sellerId,
    },
  });

  dclient.send(scanCmd, (err, data) => {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      res.send((data?.Items ?? []) as Item[]);
    }
  });
}

export function getActiveItems(res: Response) {
  const scanCmd = new ScanCommand({
    TableName: TABLE_NAMES.ITEMS,
    FilterExpression: "itemState = :state",
    ExpressionAttributeValues: {
      ":state": "active",
    },
    Limit: 50,
  });

  dclient.send(scanCmd, (err, data) => {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      res.send(data?.Items ?? []);
    }
  });
}

export function getItemDetails(itemId: string, res: Response) {
  const getCmd = new GetCommand({
    TableName: TABLE_NAMES.ITEMS,
    Key: {
      "id": itemId,
    },
  });
  dclient.send(getCmd, (err, data) => {
    if (err) {
      res.status(500).send({ error: err });
    } else if (data?.Item === undefined) {
      res.status(404).send({ error: "Item not found." });
    } else {
      res.send(data.Item as Item);
    }
  });
}

export function getItemBids(itemId: string, res: Response) {
  const scanBidCmd = new ScanCommand({
    TableName: "dev-bids3",
    FilterExpression: "bidItemId = :id",
    ExpressionAttributeValues: {
      ":id": itemId,
    },
  });
  dclient.send(scanBidCmd, (err, data) => {
    if (err) {
      res.status(500).send({ error: err });
    } else {
      res.send(data?.Items ?? []);
    }
  });
}