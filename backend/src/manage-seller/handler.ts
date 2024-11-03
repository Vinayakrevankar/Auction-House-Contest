import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Response } from 'express';

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
      res.status(err.statusCode || 500).send({
        code: err.name,
        name: err.name,
        message: err.message,
        time: err.time,
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

