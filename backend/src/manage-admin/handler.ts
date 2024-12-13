import { ScanCommand, UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Request, Response, } from "express";

import { ErrorResponsePayload } from "../api";
import { ADMIN_ID } from "../constants";

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
  console.log("Processing item freeze/unfreeze:", itemId, action);

  const isFrozen = action === "freeze";

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

    if (!isFrozen) {
      const getUserCmd = new GetCommand({
        TableName: "dev-users3",
        Key: { id: ADMIN_ID },
      });

      const userResponse = await dclient.send(getUserCmd);
      const itemUnfreezeRequests: string[] = userResponse.Item?.itemUnfreezeRequests || [];

      const updatedRequests = itemUnfreezeRequests.filter((id) => id !== itemId);

      if (updatedRequests.length !== itemUnfreezeRequests.length) {
        // If the itemId was found and removed, update the user table
        const updateAdminCmd = new UpdateCommand({
          TableName: "dev-users3",
          Key: { id: ADMIN_ID },
          UpdateExpression: "set itemUnfreezeRequests = :itemUnfreezeRequests",
          ExpressionAttributeValues: {
            ":itemUnfreezeRequests": updatedRequests,
          },
        });

        await dclient.send(updateAdminCmd);
      }
    }

    await dclient.send(updateCmd);

    res.status(200).send({
      status: 200,
      message: `Item successfully ${isFrozen ? "frozen" : "unfrozen"}`,
      payload: { itemId, isFrozen },
    });
  } catch (err) {
    console.error("Error processing freeze/unfreeze:", err);

    res.status(500).send({
      status: 500,
      message: "Internal Server Error",
      error: err,
    });
  }
}
