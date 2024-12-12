import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Request, Response } from "express";

import { ErrorResponsePayload } from "../api";

const dclient = new DynamoDBClient({ region: "us-east-1" });

export function getAllBids(req: Request, res: Response) {
  const scanCmd = new ScanCommand({
    TableName: "dev-bids3",
    Limit: 100,
  });

  dclient.send(scanCmd, (err, data) => {
    if (err) {
      res.status(500).send(<ErrorResponsePayload>{
        status: 400,
        message: err,
      });
    } else {
      console.log("Scan data:", data);
      res.status(200).send({
        status: 200,
        message: "Success",
        payload: data?.Items,
      });
    }
  });
}

export async function freezeItem(req: Request, res: Response) {
  const itemId = req.params["itemId"];
  const { action } = req.body;
  console.log("Freezing item:", itemId, action);
  // Update the isFrozen attribute to true
  const isFrozen = action === "freeze" ? true : false;
  try {
    const updateCmd = new UpdateCommand({
      TableName: "dev-items3",
      Key: {
        id: itemId,
      },
      UpdateExpression: "set isFrozen = :isFrozen",
      ExpressionAttributeValues: {
        ":isFrozen": isFrozen,
      },
      ReturnValues: "NONE",
    });

    const updateResp = await dclient.send(updateCmd);
    res.status(200).send({
      status: 200,
      message: `Item successfully frozen`,
      payload: { itemId, isFrozen },
    });
  } catch (err) {
    res.status(500).send(<ErrorResponsePayload>{
      status: 400,
      message: err,
    });
  }
}
