import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getSuccess, getCreated, getBadRequest, getUnauthorized, getException } from '../util/httpUtil'; // Import response utilities

const dclient = new DynamoDBClient({ region: "us-east-1" });
const JWT_SECRET = 'JqaXPsfAMN4omyJWj9c8o9nbEQStbsiJ';
const USER_DB = "dev-users3";

export async function register(req: Request, res: Response) {
  const { username, password, email, firstName, lastName, userType, role } = req.body;

  if (!username || !password || !email || !firstName || !lastName) {
    return res.status(400).json(getBadRequest([null, "All fields are required."]));
  }

  try {
    const getUserCommand = new GetCommand({
      TableName: USER_DB,
      Key: { id: email }
    });
    const existingUser = await dclient.send(getUserCommand);

    if (existingUser.Item) {
      return res.status(400).json(getBadRequest([null, "User already exists."]));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const uniqueId = `${firstName.slice(0, 2).toUpperCase()}${lastName.slice(0, 2).toUpperCase()}${timestamp.toString().slice(-5)}${randomSuffix}`;

    const putUserCommand = new PutCommand({
      TableName: USER_DB,
      Item: {
        createdAt: timestamp,
        username,
        password: hashedPassword,
        id: email,
        firstName,
        lastName,
        userType,
        role,
        isActive: true,
        userId: uniqueId
      }
    });

    await dclient.send(putUserCommand);

    const token = jwt.sign(
      { username, id: email, email, role, userType, firstName, lastName, isActive: true, userId: uniqueId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(201).json(getCreated({ token }, "User registered successfully."));
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json(getException([null, "Could not register user."]));
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(getBadRequest([null, "Email and password are required."]));
  }

  try {
    const getUserCommand = new GetCommand({
      TableName: USER_DB,
      Key: { id: email }
    });
    const userResult = await dclient.send(getUserCommand);

    if (!userResult.Item) {
      return res.status(401).json(getUnauthorized([null, "Invalid credentials."]));
    }

    const user = userResult.Item;
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json(getUnauthorized([null, "Invalid credentials."]));
    }

    const token = jwt.sign(
      { username: user.username, id: email, firstName: user.firstName, lastName: user.lastName,isActive: user.isActive, email: user.id, role: user.role, userType: user.userType, userId: user.userId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    return res.status(200).json(getSuccess({ token }, "Login successful"));
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json(getException([null, "Could not log in."]));
  }
}