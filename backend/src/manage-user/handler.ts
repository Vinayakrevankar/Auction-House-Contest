import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const dclient = new DynamoDBClient({ region: "us-east-1" });
const JWT_SECRET = 'JqaXPsfAMN4omyJWj9c8o9nbEQStbsiJ';

export async function register(req: Request, res: Response) {
  const { username, password, email, firstName, lastName, userType, role } = req.body;

  if (!username || !password || !email || !firstName || !lastName) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if the user already exists
    const getUserCommand = new GetCommand({
      TableName: "dev-users2",
      Key: {
        username: username
      }
    });
    const existingUser = await dclient.send(getUserCommand);

    if (existingUser.Item) {
      return res.status(400).json({ error: "User already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = Date.now().toString().slice(-5); // Take the last 5 digits of the timestamp
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // Generates a 3-digit random number, padded to ensure it's always 3 digits
    const sellerId = `${firstName.slice(0, 2)}${lastName.slice(0, 2)}${timestamp}${randomSuffix}`; // Combines the parts to form a unique ID
    const buyerId = `${firstName.slice(0, 2)}${lastName.slice(0, 2)}${timestamp}${randomSuffix}`; // Combines the parts to form a unique ID
    
    // Insert new user
    const putUserCommand = new PutCommand({
      TableName: "dev-users2",
      Item: {
        username,
        password: hashedPassword, // Store hashed password
        id: email,
        firstName,
        lastName,
        userType,
        role,
        isActive: true,
        ...(userType === "seller" ? { sellerId } : { buyerId })
      }
    });

    await dclient.send(putUserCommand);

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Could not register user." });
  }
}


export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    // Retrieve user by username
    const getUserCommand = new GetCommand({
      TableName: "dev-users2",
      Key: {
        id: email
      }
    });
    const userResult = await dclient.send(getUserCommand);

    if (!userResult.Item) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = userResult.Item;

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, email: user.id, role: user.role, userType: user.userType, ...(user.sellerId ? { sellerId: user.sellerId } : { buyerId: user.buyerId }) }, // Payload with username and email
      JWT_SECRET,
      { expiresIn: '15m' } // Token expires in 15 miniutes
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ error: "Could not log in." });
  }
}