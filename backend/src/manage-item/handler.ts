import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, UpdateCommand, DeleteCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { TABLE_NAMES } from "./constants";
import { ErrorResponsePayload, Item, ItemRequestPayload, PlainSuccessResponsePayload } from "../api";
import moment from "moment";
import { Request, Response } from "express";

// import { S3_BUCKET_URL } from "./../constants";
const dclient = new DynamoDBClient({ region: "us-east-1" });

export async function addItem(
  sellerId: string,
  itemData: ItemRequestPayload,
  res: Response
) {
  // Validate input data according to AddItemRequest schema
  const requiredFields = ['name', 'description', 'initPrice', 'lengthOfAuction', 'images'];
  for (const field of requiredFields) {
    if (!itemData[field]) {
      res.status(400).send(<ErrorResponsePayload>{
        status: 400,
        message: `${field} is required`,
      });
      return;
    }
  }

  if (itemData.initPrice < 1) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "initPrice must be at least $1",
    });
    return;
  }

  if (!Array.isArray(itemData.images) || itemData.images.length === 0) {
    res.status(400).send(<ErrorResponsePayload>{
      status: 400,
      message: "At least one image is required",
    });
    return;
  }

  const itemId = uuidv4();
  const createAt = Date.now();

  // Calculate startDate and endDate based on lengthOfAuction
  const startDate = new Date(); // Auction starts now
  const endDate = new Date(startDate.getTime() + itemData.lengthOfAuction);

  const item: Item = {
    id: itemId,
    sellerId: sellerId,
    name: itemData.name,
    description: itemData.description,
    images: itemData.images,
    initPrice: itemData.initPrice,
    lengthOfAuction: itemData.lengthOfAuction,
    startDate: moment(startDate).toISOString(true),
    endDate: moment(endDate).toISOString(true),
    itemState: "inactive", // Initial state is inactive
    isFrozen: false,
    createAt: createAt,
    // Initialize optional fields
    currentBidId: undefined,
    pastBidIds: [],
    soldBidId: undefined,
    isAvailableToBuy: itemData.isAvailableToBuy ?? false,
  };

  const cmd = new PutCommand({
    TableName: "dev-items3",
    Item: item,
  });

  try {
    await dclient.send(cmd);
    res.status(201).send(<PlainSuccessResponsePayload>{
      status: 201,
      message: "Item added successfully",
    });
  } catch (err) {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: err,
    });
  }
}
export async function editItem(
  sellerId: string,
  itemId: string,
  itemData: ItemRequestPayload,
  res: Response
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
      res.status(404).send(<ErrorResponsePayload>{
        status: 404,
        message: "Item not found",
      });
      return;
    }

    if (item.sellerId !== sellerId) {
      res.status(403).send(<ErrorResponsePayload>{
        status: 403,
        message: "You can only edit your own items",
      });
      return;
    }

    if (item.itemState !== "inactive") {
      res.status(403).send(<ErrorResponsePayload>{
        status: 403,
        message: "Only inactive items can be edited",
      });
      return;
    }

    // Prepare the update expression and attribute values
    let updateExpression = "SET updateAt = :updateAt";
    const expressionAttributeValues = { ":updateAt": Date.now() };
    const expressionAttributeNames = {};

    if (itemData.name) {
      updateExpression += ", #name = :name";
      expressionAttributeValues[":name"] = itemData.name;
      expressionAttributeNames["#name"] = "name";
    }

    if (itemData.description) {
      updateExpression += ", description = :description";
      expressionAttributeValues[":description"] = itemData.description;
    }
    if (itemData.isAvailableToBuy) {
      updateExpression += ", isAvailableToBuy = :isAvailableToBuy";
      expressionAttributeValues[":isAvailableToBuy"] = itemData.isAvailableToBuy;
    }

    if (itemData.images) {
      if (!Array.isArray(itemData.images) || itemData.images.length === 0) {
        res.status(400).send(<ErrorResponsePayload>{
          status: 400,
          message: "At least one image is required",
        });
        return;
      }
      updateExpression += ", images = :images";
      expressionAttributeValues[":images"] = itemData.images;
    }

    if (itemData.initPrice) {
      if (itemData.initPrice < 1) {
        res.status(400).send(<ErrorResponsePayload>{
          status: 400,
          message: "initPrice must be at least $1",
        });
        return;
      }
      updateExpression += ", initPrice = :initPrice";
      expressionAttributeValues[":initPrice"] = itemData.initPrice;
    }

    if (itemData.lengthOfAuction) {
      if (itemData.lengthOfAuction < 1) {
        res.status(400).send(<ErrorResponsePayload>{
          status: 400,
          message: "lengthOfAuction must be at least 1 day",
        });
        return;
      }
      updateExpression += ", lengthOfAuction = :lengthOfAuction";
      expressionAttributeValues[":lengthOfAuction"] = itemData.lengthOfAuction;
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

    res.status(200).send(<PlainSuccessResponsePayload>{
      status: 200,
      message: "Item updated successfully",
    });
  } catch (err) {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: err,
    });
  }
}

export async function removeInactiveItem(
  sellerId: string,
  itemId: string,
  res: Response
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
      res.status(404).send(<ErrorResponsePayload>{
        status: 404,
        message: "Item not found",
      });
      return;
    }

    if (item.sellerId !== sellerId) {
      res.status(403).send(<ErrorResponsePayload>{
        status: 403,
        message: "You can only remove your own items",
      });
      return;
    }

    if (item.itemState !== "inactive") {
      res.status(403).send(<ErrorResponsePayload>{
        status: 403,
        message: "Only inactive items can be removed",
      });
      return;
    }

    // Delete the item
    const deleteCmd = new DeleteCommand({
      TableName: "dev-items3",
      Key: { id: itemId },
    });

    await dclient.send(deleteCmd);

    res.status(200).send(<PlainSuccessResponsePayload>{
      status: 200,
      message: "Item removed successfully",
    });
  } catch (err) {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: err,
    });
  }
}


//Publish item
export async function publishItem(sellerId: string, itemId: string, res: Response) {
  const getCmd = new GetCommand({
    TableName: "dev-items3",
    Key: {
      "id": itemId,
    },
  });
  const resp = await dclient.send(getCmd).catch(err => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: err,
    });
  });
  if (!resp) {
    return;
  } else if (!resp.Item) {
    res.status(404).send(<ErrorResponsePayload>{
      status: 404,
      message: "Item not found",
    });
    return;
  }
  const item = resp.Item as Item;
  const sdate = new Date();
  const edate = new Date(sdate.getTime() + item.lengthOfAuction);
  const updateCmd = new UpdateCommand({
    TableName: TABLE_NAMES.ITEMS,
    Key: {
      "id": itemId,
    },
    UpdateExpression: "SET itemState = :new, startDate = :sdate, endDate = :edate",
    ConditionExpression: "itemState = :old AND sellerId = :sid",
    ExpressionAttributeValues: {
      ":new": "active",
      ":sdate": moment(sdate).toISOString(true),
      ":edate": moment(edate).toISOString(true),
      ":old": "inactive",
      ":sid": sellerId,
    },
  });
  dclient.send(updateCmd, (err) => {
    if (err) {
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: err,
      });
    } else {
      res.status(200).send(<PlainSuccessResponsePayload>{
        status: 200,
        message: "Success",
      });
    }
  });
}
//Unpublish item
export function unpublishItem(sellerId: string, itemId: string, res: Response) {
  const cmd = new UpdateCommand({
    TableName: TABLE_NAMES.ITEMS,
    Key: {
      "id": itemId,
    },
    UpdateExpression: "SET itemState = :new",
    // ConditionExpression: "itemState = :old AND sellerId = :sid AND (attribute_not_exists(currentBidId) OR currentBidId = :null)",
    ConditionExpression: [
      "itemState = :old",
      "sellerId = :sid",
      "(attribute_not_exists(currentBidId) OR currentBidId = :null)",
      "(attribute_not_exists(pastBidIds) OR size(pastBidIds) = :zero)"
    ].join(" AND "),
    ExpressionAttributeValues: {
      ":new": "inactive",
      ":old": "active",
      ":sid": sellerId,
      ":null": null,
      ":zero": 0,
    },
  });
  dclient.send(cmd, (err) => {
    if (err) {
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: err,
      });
    } else {
      res.status(200).send(<PlainSuccessResponsePayload>{
        status: 200,
        message: "Success",
      });
    }
  });
}

function updateURL(data: Item): Item {
  return data;
}

function updateURLs(data: Item[]): Item[] {
  return (data.length > 0 ? data.map(updateURL) : []);
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
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: err,
      });
    } else {
      res.send({
        status: 200,
        message: "Success",
        payload: updateURLs((data?.Items ?? []) as Item[]),
      });
    }
  });
}

//Get all item
export function getAllItems(req: Request, res: Response) {
  const scanCmd = new ScanCommand({
    TableName: TABLE_NAMES.ITEMS,
  });

  dclient.send(scanCmd, (err, data) => {
    if (err) {
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: err,
      });
    } else {
      res.send({
        status: 200,
        message: "Success",
        payload: updateURLs((data?.Items ?? []) as Item[]),
      });
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
      res.status(500).send(<ErrorResponsePayload>{
        status: 400,
        message: err,
      });
    } else {
      res.status(200).send({
        status: 200,
        message: "Success",
        payload: updateURLs((data?.Items ?? []) as Item[]),
      });
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
      res.status(500).send(<ErrorResponsePayload>{
        status: 400,
        message: err,
      });
    } else if (data?.Item === undefined) {
      res.status(404).send(<ErrorResponsePayload>{
        status: 400,
        message: "Item not found.",
      });
    } else {
      res.send({
        status: 200,
        message: "Success",
        payload: updateURL(data.Item as Item),
      });
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
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: err,
      });
    } else {
      res.send({
        status: 200,
        message: "Success",
        payload: data?.Items ?? [],
      });
    }
  });
}

export async function checkExpirationStatus(itemId: string, res: Response) {
  const getCmd = new GetCommand({
    TableName: "dev-items3",
    Key: {
      "id": itemId,
    },
  });
  const resp = await dclient.send(getCmd).catch(err => {
    res.status(500).send(<ErrorResponsePayload>{
      status: 500,
      message: `Failed to get item ${itemId}: ${err}`,
    });
  });
  if (!resp) {
    return;
  } else if (!resp.Item) {
    res.status(404).send(<ErrorResponsePayload>{
      status: 404,
      message: "Item not found",
    });
  } else {
    const item = resp.Item as Item;
    const currTime = new Date();
    const endDate = new Date(item.endDate);
    if (item.itemState === "completed" || item.itemState === "failed") {
      // Already expired.
      res.send({
        status: 200,
        message: "Success",
        payload: {
          isExpired: true,
        },
      });
    }
    else if (currTime.getTime() <= endDate.getTime()) {
      res.send({
        status: 200,
        message: "Success",
        payload: {
          isExpired: false,
        },
      });
    } else {
      // NOTE: Update item state
      let new_state = "completed";
      if (!item.currentBidId || !item.pastBidIds || item.pastBidIds.length === 0) {
        new_state = "failed";
      }
      const updateCmd = new UpdateCommand({
        TableName: "dev-items3",
        Key: {
          "id": itemId,
        },
        UpdateExpression: "SET itemState = :new",
        ExpressionAttributeValues: {
          ":new": new_state,
        },
      });
      const resp = await dclient.send(updateCmd).catch(err => {
        res.status(500).send({
          status: 500,
          message: `Failed to update item ${itemId}: ${err}`,
        });
      });
      if (!resp) {
        return;
      }
      res.send({
        status: 200,
        message: "Success",
        payload: {
          isExpired: true,
        },
      });
    }
  }
}

// working

// export function getRecentlySoldItems(req: Request, res: Response) {
//   const { keywords, minPrice, maxPrice, sortBy, sortOrder } = req.query;

//   // Parse query parameters
//   const kw = keywords ? (keywords as string).toLowerCase() : null;
//   const minP = minPrice ? parseFloat(minPrice as string) : null;
//   const maxP = maxPrice ? parseFloat(maxPrice as string) : null;

//   // Determine sort field
//   let sortField: "endDate" | "initPrice" = "endDate"; 
//   if (sortBy === "price") {
//     sortField = "initPrice";
//   } else if (sortBy === "date") {
//     sortField = "endDate";
//   }

//   const order = sortOrder === "desc" ? -1 : 1;
//   const cutoffTime = moment().subtract(24, "hours");

//   const scanCmd = new ScanCommand({
//     TableName: TABLE_NAMES.ITEMS,
//     FilterExpression: "itemState IN (:a, :b)",
//     ExpressionAttributeValues: {
//       ":a": "completed",
//       ":b": "failed",
//     },
//   });

//   dclient.send(scanCmd, (err, data) => {
//     if (err) {
//       res.status(500).send(<ErrorResponsePayload>{
//         status: 500,
//         message: err.toString(),
//       });
//       return;
//     }

//     let items = (data?.Items ?? []) as Item[];

//     // Filter items by recently sold (endDate within last 24 hours)
//     items = items.filter(item => {
//       const endDate = moment(item.endDate);
//       return endDate.isAfter(cutoffTime);
//     });

//     // Keyword filter
//     if (kw) {
//       items = items.filter(item =>
//         (item.name && item.name.toLowerCase().includes(kw)) ||
//         (item.description && item.description.toLowerCase().includes(kw))
//       );
//     }

//     // Price filters
//     if (minP !== null) {
//       items = items.filter(item => item.initPrice >= minP);
//     }
//     if (maxP !== null) {
//       items = items.filter(item => item.initPrice <= maxP);
//     }

//     // Sort items by chosen field
//     items.sort((a, b) => {
//       let valA: number | string = a[sortField];
//       let valB: number | string = b[sortField];

//       if (sortField === "endDate") {
//         valA = new Date(valA as string).getTime();
//         valB = new Date(valB as string).getTime();
//       }

//       if (valA < valB) return -1 * order;
//       if (valA > valB) return 1 * order;
//       return 0;
//     });

//     res.status(200).send({
//       status: 200,
//       message: "Success",
//       payload: items,
//     });
//   });
// }

export function getRecentlySoldItems(req: Request, res: Response) {
  const scanCmd = new ScanCommand({
    TableName: TABLE_NAMES.ITEMS,
    FilterExpression: "itemState IN (:a, :b)",
    ExpressionAttributeValues: {
      ":a": "completed",
      ":b": "failed",
    },
  });

  dclient.send(scanCmd, (err, data) => {
    if (err) {
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: err,
      });
    } else {
      res.send({
        status: 200,
        message: "Success",
        payload: updateURLs((data?.Items ?? []) as Item[]),
      });
    }
  });
}
