import 'express-async-errors';

import express, { json } from 'express';
import helmet from 'helmet';
// import * as OpenAPIValidator from 'express-openapi-validator';
import { archiveItem, fulfillItem, requestUnfreezeItem } from './manage-seller/handler';
import { addItem, checkExpirationStatus, editItem, removeInactiveItem } from './manage-item/handler';
import { registerHandler, loginHander, editProfileHandler } from './manage-user/handler';
import { getActiveItems, getItemBids, getItemDetails, publishItem, reviewItems, unpublishItem } from './manage-item/handler'
import {placeBid,addFunds,reviewPurchases, reviewActiveBids} from './manage-buyer/handler';
import * as httpUtil from './util/httpUtil';
import { authFilterMiddleware } from './security/authFilterMiddleware';
import { asyncMiddleware as _async } from './security/asyncMiddleware';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
// Initialize S3 client
const s3Client = new S3Client({ region: 'us-east-1' });
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponsePayload, PlainSuccessResponsePayload } from "./api";

// Initialize multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});
const bucketName = 'serverless-auction-house-dev-images';
// const bucketName = process.env.BUCKET_NAME;
const app = express();
app.use(json());
app.use(helmet());

app.get('/', authFilterMiddleware, (_, res) => {
  res.json({
    msg: 'Hello World',
  });
});

// See https://cdimascio.github.io/express-openapi-validator-documentation/guide-standard/
// to write handlers.
// app.use(OpenAPIValidator.middleware({
//   apiSpec: "../../spec.yaml",
//   validateRequests: true,
//   validateResponses: true,
//   validateApiSpec: true,
// }));

// Seller use cases
// Add Item
app.post(
  '/api/sellers/:sellerId/items',
  authFilterMiddleware,
  (req, res) => addItem(req.params['sellerId'], req.body, res),
);
// Edit Item
app.put(
  '/api/sellers/:sellerId/items/:itemId',
  authFilterMiddleware, upload.array('images', 2),
  (req, res) => editItem(req.params['sellerId'], req.params['itemId'], req.body, res),
);
// Remove Inactive Item
app.delete(
  '/api/sellers/:sellerId/items/:itemId',
  authFilterMiddleware,
  (req, res) => removeInactiveItem(req.params['sellerId'], req.params['itemId'], res),
);

app.post(
  '/api/sellers/:sellerId/items/:itemId/publish',
  authFilterMiddleware,
  (req, res) => publishItem(req.params['sellerId'], req.params['itemId'], res),
);
app.post(
  '/api/sellers/:sellerId/items/:itemId/unpublish',
  authFilterMiddleware, (req, res) => unpublishItem(req.params['sellerId'], req.params['itemId'], res),
);
app.get(
  '/api/sellers/:sellerId/items',
  authFilterMiddleware, (req, res) => reviewItems(req.params['sellerId'], res),
);

// Fulfill Item
app.post(
  '/api/sellers/:sellerId/items/:itemId/fulfill',
  authFilterMiddleware, (req, res) => fulfillItem(req.params['sellerId'], req.params['itemId'], res),
);
// Archive Item
app.post(
  '/api/sellers/:sellerId/items/:itemId/archive',
  authFilterMiddleware, (req, res) => archiveItem(req.params['sellerId'], req.params['itemId'], res),
);
// Request Unfreeze Item
app.post(
  '/api/sellers/:sellerId/items/:itemId/request-unfreeze',
  authFilterMiddleware, (req, res) => requestUnfreezeItem(req.params['sellerId'], req.params['itemId'], res),
);

app.get('/api/items/active', (_, res) => getActiveItems(res));
app.get('/api/items/:itemId', (req, res) => getItemDetails(req.params["itemId"], res));
app.get('/api/items/:itemId/bids', (req, res) => getItemBids(req.params["itemId"], res));
app.post('/api/items/:itemId/check-expired', (req, res) => checkExpirationStatus(req.params["itemId"], res));

// login and register
app.post('/api/register', registerHandler);
app.post('/api/login', loginHander);
app.put('/api/profile/update', editProfileHandler);
// Upload endpoint to handle file upload to S3

// Buyer use cases
// Place a new bid
app.post('/api/buyers/:buyerId/bids', authFilterMiddleware, (req, res) => {
  placeBid(req, res);
});

// Review active bids
app.get('/api/buyers/:buyerId/bids', authFilterMiddleware, (req, res) => {
  reviewActiveBids(req, res);
});

// Review purchases
app.get('/api/buyers/:buyerId/purchases', authFilterMiddleware, (req, res) => {
  reviewPurchases(req, res);
});

// Add funds
app.post('/api/buyers/:buyerId/add-funds', authFilterMiddleware, (req, res) => {
  addFunds(req, res);
});




app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const file = req.file;
  const fileExtension = path.extname(file.originalname); // Extract the file extension
  const uniqueKey = `${uuidv4()}${fileExtension}`; // Append extension to unique key


  try {
    const params = {
      Bucket: bucketName,
      Key: uniqueKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    // const command = new GetObjectCommand({
    //   Bucket: bucketName,
    //   Key: uniqueKey,
    // });
    // const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour

    res.status(200).json(<PlainSuccessResponsePayload>{
      status: 200,
      message: 'File uploaded successfully',
      payload: {
        key: uniqueKey,
      },
      // url: signedUrl,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json(<ErrorResponsePayload>{
      status: 500,
      message: `Error in uploading image: ${error.message}`,
    });

  }
});
app.all('*', (req, res) => {
  res.json(httpUtil.getNotFound());
});

export { app };

