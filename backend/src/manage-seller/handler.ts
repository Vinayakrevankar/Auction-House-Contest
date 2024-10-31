import * as AWS from 'aws-sdk';
import { Response } from 'express';

AWS.config.update({ region: 'us-east-1' });

const DDB = new AWS.DynamoDB();
const DocClient = new AWS.DynamoDB.DocumentClient();

export function archiveItem(sellerId: string, itemId: string, res: Response<any, Record<string, any>>) {
  DocClient.update({
    TableName: 'dev-items',
    Key: {
      'item-id': itemId,
    },
    UpdateExpression: "SET itemState = :new",
    ConditionExpression: "itemState = :old AND sellerId = :sid",
    ExpressionAttributeValues: {
      ":new": "archived",
      ":old": "inactive",
      ":sid": sellerId,
    },
  }, (err, _) => {
    if (err) {
      res.status(err.statusCode || 500).send({
        code: err.code,
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
