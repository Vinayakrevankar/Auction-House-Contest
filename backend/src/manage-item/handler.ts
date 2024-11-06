import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, UpdateCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { REGION, TABLE_NAMES, ITEM_STATES, MESSAGES } from "./constants";

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
export async function publishItem(sellerId, itemId, res) {
  try {
    if (!sellerId || !itemId) {
      return res
        .status(400)
        .json({ error: "sellerId and itemId are required" });
    }

    const getItemCmd = new GetCommand({
      TableName: TABLE_NAMES.ITEMS,
      Key: { id: itemId },
    });

    const itemResult = await dclient.send(getItemCmd);

    if (!itemResult.Item) {
      console.error("Item not found with id:", itemId);
      return res.status(404).json({ error: MESSAGES.ITEM_NOT_FOUND });
    }

    if (itemResult.Item.sellerId !== sellerId) {
      console.error("Unauthorized access: sellerId mismatch");
      return res.status(403).json({ error: MESSAGES.UNAUTHORIZED });
    }

    const currentState = itemResult.Item.itemState;

    if (currentState === ITEM_STATES.ACTIVE) {
      return res.status(400).json({
        error: "Item is already active and cannot be published again",
        itemId: itemId,
        itemState: currentState,
      });
    }

    const allowedPreviousStates = [
      ITEM_STATES.INACTIVE,
      ITEM_STATES.UNPUBLISHED,
    ];

    if (!allowedPreviousStates.includes(currentState)) {
      return res.status(400).json({
        error: `Cannot publish item from state: ${currentState}`,
        itemId: itemId,
        itemState: currentState,
      });
    }

    const params = {
      TableName: TABLE_NAMES.ITEMS,
      Key: { id: itemId },
      UpdateExpression: "SET itemState = :new",
      ConditionExpression: "itemState = :old",
      ExpressionAttributeValues: {
        ":new": ITEM_STATES.ACTIVE,
        ":old": currentState,
      },
    };

    const cmd = new UpdateCommand(params);
    await dclient.send(cmd);

    res.json({
      message: MESSAGES.PUBLISH_SUCCESS,
      itemId: itemId,
      itemState: ITEM_STATES.ACTIVE,
    });
  } catch (err) {
    console.error("Error publishing item:", err);
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(400).json({
        error: "Failed to publish item due to state mismatch",
        itemId: itemId,
        itemState: currentState,
      });
    } else {
      res.status(err.statusCode || 500).json({
        code: err.name,
        name: err.name,
        message: err.message || MESSAGES.INTERNAL_SERVER_ERROR,
        time:
          err.$metadata && err.$metadata.attempts
            ? err.$metadata.attempts
            : undefined,
      });
    }
  }
}
//Unpublish item
export async function unpublishItem(sellerId, itemId, res) {
  try {
    if (!sellerId || !itemId) {
      return res
        .status(400)
        .json({ error: "sellerId and itemId are required" });
    }

    const getItemCmd = new GetCommand({
      TableName: TABLE_NAMES.ITEMS,
      Key: { id: itemId },
    });

    const itemResult = await dclient.send(getItemCmd);

    if (!itemResult.Item) {
      console.error("Item not found with id:", itemId);
      return res.status(404).json({ error: MESSAGES.ITEM_NOT_FOUND });
    }

    if (itemResult.Item.sellerId !== sellerId) {
      console.error("Unauthorized access: sellerId mismatch");
      return res.status(403).json({ error: MESSAGES.UNAUTHORIZED });
    }

    const currentState = itemResult.Item.itemState;

    if (currentState === ITEM_STATES.INACTIVE) {
      return res.status(400).json({
        error: "Item is inactive and cannot be unpublished",
        itemId: itemId,
        itemState: currentState,
      });
    }

    const allowedPreviousStates = [ITEM_STATES.ACTIVE];

    if (!allowedPreviousStates.includes(currentState)) {
      return res.status(400).json({
        error: `Cannot unpublish item from state: ${currentState}`,
        itemId: itemId,
        itemState: currentState,
      });
    }

    const params = {
      TableName: TABLE_NAMES.ITEMS,
      Key: { id: itemId },
      UpdateExpression: "SET itemState = :new",
      ConditionExpression: "itemState = :old",
      ExpressionAttributeValues: {
        ":new": ITEM_STATES.INACTIVE,
        ":old": currentState,
      },
    };

    const cmd = new UpdateCommand(params);
    await dclient.send(cmd);

    res.json({
      message: MESSAGES.UNPUBLISH_SUCCESS,
      itemId: itemId,
      itemState: ITEM_STATES.INACTIVE,
    });
  } catch (err) {
    console.error("Error unpublishing item:", err);
    if (err.name === "ConditionalCheckFailedException") {
      return res.status(400).json({
        error: "Failed to unpublish item due to state mismatch",
        itemId: itemId,
        itemState: currentState,
      });
    } else {
      res.status(err.statusCode || 500).json({
        code: err.name,
        name: err.name,
        message: err.message || MESSAGES.INTERNAL_SERVER_ERROR,
        time:
          err.$metadata && err.$metadata.attempts
            ? err.$metadata.attempts
            : undefined,
      });
    }
  }
}

//Review item
export async function reviewItem(
  sellerId: string,
  itemId: string,
  res: Response
) {
  const getCmd = new GetCommand({
    TableName: TABLE_NAMES.ITEMS,
    Key: { id: itemId },
  });

  try {
    const result = await dclient.send(getCmd);
    const item = result.Item;

    if (!item) {
      res.status(404).send({ error: MESSAGES.ITEM_NOT_FOUND });
      return;
    }

    if (item.sellerId !== sellerId) {
      res.status(403).send({ error: "You can only review your own items" });
      return;
    }

    res.send({
      message: MESSAGES.REVIEW_SUCCESS,
      item: item,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).send({
      code: err.name,
      name: err.name,
      message: err.message || MESSAGES.INTERNAL_SERVER_ERROR,
      time: err.$metadata?.attempts ? err.$metadata.attempts : undefined,
    });
  }
}
  
