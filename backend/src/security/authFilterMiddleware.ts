import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import jwt from "jsonwebtoken";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import * as httpUtil from "./../util/httpUtil";
import * as securityDA from "./securityDA";

// Initialize DynamoDB client and store it in app.locals
const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const JWT_SECRET = "JqaXPsfAMN4omyJWj9c8o9nbEQStbsiJ";

interface User {
  username: string;
  password: string;
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  role: string;
  userType: string;
  userId: string;
  isActive: boolean;
  iat: number;
  exp: number;
}

export const authFilterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.app.locals.dynamoDBClient) {
    req.app.locals.dynamoDBClient = dynamoDBClient;
  }

  try {
    const token = req.get("Authorization");
    console.log("token>>>>", token);
    if (token && token.split(".").length > 1) {
      console.log("LINE 32", token);
      const userInfo = jwt.verify(token, JWT_SECRET) as User;
      console.log("userInfo>>>>>", userInfo);
      if (_.isEmpty(userInfo)) {
        res.json(httpUtil.getUnauthorized());
        return;
      }

      const {
        emailAddress,
        firstName,
        lastName,
        username,
        role,
        userType,
        userId,
      } = userInfo;

      const user = (await securityDA.getUser(
        req.app.locals.dynamoDBClient,
        emailAddress
      )) as User | undefined;

      if (!user || user.id !== emailAddress || user.username !== username) {
        res.json(httpUtil.getUnauthorized());
        return;
      }

      if (user.isActive === false) {
        res
          .status(403)
          .json(
            httpUtil.getAccessDenied([
              null,
              "Your account has been deactivated.",
            ])
          );
        return;
      }

      // Store additional user info in res.locals
      res.locals.id = emailAddress;
      res.locals.emailAddress = emailAddress;
      res.locals.firstName = firstName;
      res.locals.lastName = lastName;
      res.locals.username = username;
      res.locals.role = role;
      res.locals.userType = userType;
      res.locals.userId = userId;

      next();
    } else {
      console.log("LINE 32", token);

      throw new Error("Token Expired/Invalid Token");
    }
  } catch (error) {
    console.error(error);
    res.status(401).json(httpUtil.getUnauthorized());
  }
};
