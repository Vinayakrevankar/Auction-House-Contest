import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import {
  DynamoDBClient,
  DynamoDBServiceException,
} from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  getSuccess,
  getCreated,
  getBadRequest,
  getUnauthorized,
  getException,
  getAccessDenied,
  getNotFound,
} from "../util/httpUtil"; // Import response utilities

const dclient = new DynamoDBClient({ region: "us-east-1" });
const JWT_SECRET = "JqaXPsfAMN4omyJWj9c8o9nbEQStbsiJ";
const USER_DB = "dev-users3";

export async function registerHandler(req: Request, res: Response) {
  const {
    username,
    password,
    emailAddress,
    firstName,
    lastName,
    userType,
    role,
  } = req.body;

  if (!username || !password || !emailAddress || !firstName || !lastName) {
    return res
      .status(400)
      .json(getBadRequest([null, "All fields are required."]));
  }

  try {
    const getUserCommand = new GetCommand({
      TableName: USER_DB,
      Key: { id: emailAddress },
    });
    const existingUser = await dclient.send(getUserCommand);

    if (existingUser.Item) {
      return res
        .status(400)
        .json(getBadRequest([null, "User already exists."]));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const uniqueId = `${firstName.slice(0, 2).toUpperCase()}${lastName.slice(0, 2).toUpperCase()}${timestamp.toString().slice(-5)}${randomSuffix}`;

    const putUserCommand = new PutCommand({
      TableName: USER_DB,
      Item: {
        createdAt: timestamp,
        username,
        password: hashedPassword,
        id: emailAddress,
        firstName,
        lastName,
        userType,
        role,
        isActive: true,
        userId: uniqueId,
      },
      ConditionExpression: "attribute_not_exists(id)", // Ensure no duplicate email
    });

    await dclient.send(putUserCommand);

    const token = jwt.sign(
      {
        username,
        id: emailAddress,
        emailAddress,
        role,
        userType,
        firstName,
        lastName,
        isActive: true,
        userId: uniqueId,
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res
      .status(201)
      .json(
        getCreated(
          { username, emailAddress, userType, role, userId: uniqueId, token },
          "User registered successfully."
        )
      );
  } catch (error) {
    console.error("Error registering user:", error);

    // Handle conditional check failure
    if (error.name === "ConditionalCheckFailedException") {
      return res
        .status(400)
        .json(getBadRequest([null, "User already exists."]));
    }

    return res
      .status(500)
      .json(getException([null, "Could not register user."]));
  }
}

export async function loginHandler(req: Request, res: Response) {
  const { emailAddress, password } = req.body;

  if (!emailAddress || !password) {
    return res
      .status(400)
      .json(getBadRequest([null, "Email and password are required."]));
  }

  try {
    const getUserCommand = new GetCommand({
      TableName: USER_DB,
      Key: { id: emailAddress },
    });
    const userResult = await dclient.send(getUserCommand);

    if (!userResult.Item) {
      return res
        .status(401)
        .json(getUnauthorized([null, "Invalid credentials."]));
    }

    const user = userResult.Item;
    const isActive = user.isActive === true || user.isActive === "true";
    if (isActive === false) {
      return res
        .status(403)
        .json(getAccessDenied([null, "Your account has been deactivated."]));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(getUnauthorized([null, "Invalid credentials."]));
    }

    const token = jwt.sign(
      {
        username: user.username,
        id: emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        emailAddress: user.id,
        role: user.role,
        userType: user.userType,
        userId: user.userId,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json(
      getSuccess(
        {
          username: user.username,
          emailAddress,
          userType: user.userType,
          role: user.role,
          userId: user.userId,
          token,
        },
        "Login successful"
      )
    );
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json(getException([null, "Could not log in."]));
  }
}

export async function editProfileHandler(req: Request, res: Response) {
  const {
    emailAddress,
    firstName,
    lastName,
    username,
    password,
    userType,
    role,
  } = req.body;

  if (!emailAddress) {
    return res
      .status(400)
      .json(getBadRequest([null, "Email is required to update profile."]));
  }

  const updateExpressions: string[] = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  if (username) {
    updateExpressions.push("#username = :username");
    expressionAttributeNames["#username"] = "username";
    expressionAttributeValues[":username"] = username;
  }

  if (firstName) {
    updateExpressions.push("#firstName = :firstName");
    expressionAttributeNames["#firstName"] = "firstName";
    expressionAttributeValues[":firstName"] = firstName;
  }

  if (lastName) {
    updateExpressions.push("#lastName = :lastName");
    expressionAttributeNames["#lastName"] = "lastName";
    expressionAttributeValues[":lastName"] = lastName;
  }

  if (userType) {
    updateExpressions.push("#userType = :userType");
    expressionAttributeNames["#userType"] = "userType";
    expressionAttributeValues[":userType"] = userType;
  }

  if (role) {
    updateExpressions.push("#role = :role");
    expressionAttributeNames["#role"] = "role";
    expressionAttributeValues[":role"] = role;
  }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateExpressions.push("#password = :password");
    expressionAttributeNames["#password"] = "password";
    expressionAttributeValues[":password"] = hashedPassword;
  }

  if (updateExpressions.length === 0) {
    return res.status(400).json(getBadRequest([null, "No fields to update."]));
  }

  try {
    const updateCommand = new UpdateCommand({
      TableName: USER_DB,
      Key: { id: emailAddress },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const updatedUser = await dclient.send(updateCommand);

    return res
      .status(200)
      .json(
        getSuccess(updatedUser.Attributes, "Profile updated successfully.")
      );
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json(getException([null, "Could not update profile."]));
  }
}

export async function closeAccountHandler(req: Request, res: Response) {
  const userEmail = res.locals.id; // User's email address from authentication middleware

  try {
    // Fetch the user's data from the database
    const getUserCommand = new GetCommand({
      TableName: USER_DB,
      Key: { id: userEmail },
    });
    const userResult = await dclient.send(getUserCommand);

    if (!userResult.Item) {
      return res.status(404).json(getNotFound([null, "User not found."]));
    }

    if (userResult.Item.id !== userEmail) {
      return res
        .status(403)
        .json(
          getAccessDenied([
            null,
            "You are not authorized to close this account.",
          ])
        );
    }

    // Update the user's isActive status to false
    const updateUserCommand = new UpdateCommand({
      TableName: USER_DB,
      Key: { id: userEmail },
      UpdateExpression: "SET isActive = :inactive",
      ExpressionAttributeValues: {
        ":inactive": false,
      },
      ReturnValues: "ALL_NEW",
    });

    console.log("UpdateCommand:", updateUserCommand.input);

    const updatedUser = await dclient.send(updateUserCommand);
    console.log("Updated User Response:", updatedUser);

    return res.status(200).json({
      status: 200,
      message: "Account closed successfully.",
    });
  } catch (error) {
    console.error("Error in closeAccountHandler:", error);
    return res.status(500).json({
      status: 500,
      message: "Could not close account due to an internal error.",
    });
  }
}


export async function getProfileFund(req: Request, res: Response) {    
  const emailId = res.locals.id; // User's email address from authentication middleware

  try {
    const getUserCommand = new GetCommand({
      TableName: USER_DB,
      Key: { id: emailId },
    });
    const userResult = await dclient.send(getUserCommand);

    if (!userResult.Item) {
      return res.status(404).json({ status: 404, message: "User not found." });
    }

    if (userResult.Item.id !== emailId) {
      return res.status(403).json({
        status: 403,
        message: "You are not authorized to view this account's funds.",
      });
    }

    const fund = userResult.Item.fund;

    return res.status(200).json({
      status: 200,
      message: "Funds retrieved successfully.",
      payload: {
        userId: emailId,
        funds: fund,
        fundsOnHold: userResult.Item.fundsOnHold
      },
    });
  } catch (error) {
    console.error("Error retrieving funds:", error);
    return res.status(500).json({ status: 500, message: `${error}` });
  }
}
