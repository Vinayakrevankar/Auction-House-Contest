import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import * as httpUtil from './../util/httpUtil';
import * as securityDA from './securityDA';

// Initialize DynamoDB client and store it in app.locals
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-1' });
const JWT_SECRET = "JqaXPsfAMN4omyJWj9c8o9nbEQStbsiJ";

interface User {
  username: string;
  password: string;
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  userType?: string;
  sellerId?: string;
  buyerId?: string;
}

export const authFilterMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.app.locals.dynamoDBClient) {
    req.app.locals.dynamoDBClient = dynamoDBClient;
  }

  try {
    const token = req.get('Authorization');

    if (token && token.split('.').length > 1) {
      const userInfo = jwt.verify(token, JWT_SECRET) as {
        username: string;
        email: string;
        role?: string;
        userType?: string;
        sellerId?: string;
        buyerId?: string;
      };

      if (_.isEmpty(userInfo)) {
        res.json(httpUtil.getUnauthorized());
        return;
      }

      const { email, username, role, userType, sellerId, buyerId } = userInfo;

      const user = await securityDA.getUser(req.app.locals.dynamoDBClient, email) as User | undefined;

      if (!user || user.id !== email || user.username !== username) {
        res.json(httpUtil.getUnauthorized());
        return;
      }

      // Store additional user info in res.locals
      res.locals.userId = user.id;
      res.locals.email = user.email;
      res.locals.role = role;
      res.locals.userType = userType;
      res.locals.sellerId = sellerId;
      res.locals.buyerId = buyerId;

      next();
    } else {
      throw new Error('Token Expired/Invalid Token');
    }
  } catch (error) {
    console.error(error);
    res.json(httpUtil.getUnauthorized());
  }
};