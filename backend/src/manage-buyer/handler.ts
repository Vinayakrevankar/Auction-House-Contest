import { 
    GetCommand, 
    QueryCommand, 
    BatchGetCommand 
  } from "@aws-sdk/lib-dynamodb";
  import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
  import { Response } from 'express';
  import { 
    Bid, 
    Purchase, 
    PlainSuccessResponsePayload, 
    ErrorResponsePayload 
  } from "../api";
  
  // Initialize DynamoDB Client
  const dclient = new DynamoDBClient({ region: "us-east-1" });
  
  // Constants for DynamoDB table names and index names
  const BIDS_TABLE = "dev-bids3";
  const BIDS_USER_INDEX = "bidUserId-index"; // Ensure this matches your actual GSI name
  const ITEMS_TABLE = "dev-items3";
  const USERS_TABLE = "dev-users3";
  
  /**
   * Handler to retrieve all active bids for a buyer.
   * Active bids are those where the item's auction is still active.
   * 
   * GET /buyer/bids/active
   */
  export async function getActiveBids(buyerId: string, res: Response) {
    try {
      // Step 1: Query bids from dev-bids3 where bidUserId = buyerId
      const queryBidsCmd = new QueryCommand({
        TableName: BIDS_TABLE,
        IndexName: BIDS_USER_INDEX, // GSI to query by bidUserId
        KeyConditionExpression: "bidUserId = :bidUserId",
        ExpressionAttributeValues: {
          ":bidUserId": buyerId,
        },
      });
  
      const queryBidsResp = await dclient.send(queryBidsCmd);
      const bids = queryBidsResp.Items as Bid[] | undefined;
      
      if (!bids || bids.length === 0) {
        res.status(200).send(<PlainSuccessResponsePayload>{
          status: 200,
          message: "No active bids found.",
          payload: [],
        });
        return;
      }
  
      // Step 2: Collect unique item IDs from the bids
      const itemIds = bids.map(bid => bid.bidItemId);
      const uniqueItemIds = Array.from(new Set(itemIds));
  
      // Step 3: Batch get items from dev-items3 to check their state
      const batchGetCmd = new BatchGetCommand({
        RequestItems: {
          [ITEMS_TABLE]: {
            Keys: uniqueItemIds.map(itemId => ({ id: itemId })),
            ProjectionExpression: "id, itemState",
          },
        },
      });
  
      const batchGetResp = await dclient.send(batchGetCmd);
      const items = batchGetResp.Responses?.[ITEMS_TABLE] as { id: string; itemState: string }[] | undefined;
  
      if (!items) {
        res.status(500).send(<ErrorResponsePayload>{
          status: 500,
          message: "Failed to retrieve items for bids.",
        });
        return;
      }
  
      // Step 4: Create a map of itemId to itemState for quick lookup
      const itemStateMap = new Map<string, string>();
      items.forEach(item => {
        itemStateMap.set(item.id, item.itemState);
      });
  
      // Step 5: Filter bids where the corresponding item's state is 'active'
      const activeBids = bids.filter(bid => {
        const state = itemStateMap.get(bid.bidItemId);
        return state === "active";
      });
  
      // Step 6: Send the active bids as the response
      res.status(200).send(<PlainSuccessResponsePayload>{
        status: 200,
        message: "Active bids retrieved successfully.",
        payload: activeBids,
      });
    } catch (err) {
      console.error("Error retrieving active bids:", err);
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: `Internal server error: ${err}`,
      });
    }
  }
  
  /**
   * Handler to retrieve all fulfilled purchases for a buyer.
   * Only purchases that have been fulfilled (i.e., after fulfillment) are returned.
   * 
   * GET /buyer/purchases
   */
  export async function getPurchases(buyerId: string, res: Response) {
    try {
      // Step 1: Get buyer's purchases from dev-users3
      const getUserCmd = new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          "id": buyerId,
        },
        ProjectionExpression: "purchases",
      });
  
      const getUserResp = await dclient.send(getUserCmd);
      const user = getUserResp.Item;
  
      if (!user) {
        res.status(404).send(<ErrorResponsePayload>{
          status: 404,
          message: "Buyer not found.",
        });
        return;
      }
  
      const purchases = user.purchases as Purchase[] | undefined;
  
      if (!purchases || purchases.length === 0) {
        res.status(200).send(<PlainSuccessResponsePayload>{
          status: 200,
          message: "No purchases found.",
          payload: [],
        });
        return;
      }
  
      // Step 2: Filter purchases that have been fulfilled
      const fulfilledPurchases = purchases.filter(purchase => purchase.fulfillTime);
  
      // Step 3: Send the fulfilled purchases as the response
      res.status(200).send(<PlainSuccessResponsePayload>{
        status: 200,
        message: "Purchases retrieved successfully.",
        payload: fulfilledPurchases,
      });
    } catch (err) {
      console.error("Error retrieving purchases:", err);
      res.status(500).send(<ErrorResponsePayload>{
        status: 500,
        message: `Internal server error: ${err}`,
      });
    }
  }
  