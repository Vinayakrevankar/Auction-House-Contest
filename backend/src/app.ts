import 'express-async-errors';

import express, { json } from 'express';
import helmet from 'helmet';
import * as OpenAPIValidator from 'express-openapi-validator';
import { archiveItem, fulfillItem } from './manage-seller/handler';
import { addItem, editItem, removeInactiveItem } from './manage-item/handler';
import { register, login } from './manage-user/handler';
import * as httpUtil from './util/httpUtil';
import { authFilterMiddleware } from './security/authFilterMiddleware';
import { asyncMiddleware as _async } from './security/asyncMiddleware';
const app = express();
app.use(json());
app.use(helmet());

app.get('/', (_, res) => {
  res.json([authFilterMiddleware,{
    msg: 'Hello World',
  }]);
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
  (req, res) =>
    
    addItem(req.params['sellerId'], req.body, res),
);
// // Edit Item
// app.put(
//   '/api/sellers/:sellerId/items/:itemId',
//   (req, res) => editItem(req.params['sellerId'], req.params['itemId'], req.body, res),
// );
// // Remove Inactive Item
// app.delete(
//   '/api/sellers/:sellerId/items/:itemId',
//   (req, res) => removeInactiveItem(req.params['sellerId'], req.params['itemId'], res),
// );
// Fulfill Item
app.post(
  '/api/sellers/:sellerId/items/:itemId/fulfill',
  [authFilterMiddleware,(req, res) => fulfillItem(req.params['sellerId'], req.params['itemId'], res)],
);
// Archive Item
app.post(
  '/api/sellers/:sellerId/items/:itemId/archive',
  [authFilterMiddleware,(req, res) => archiveItem(req.params['sellerId'], req.params['itemId'], res)],
);
// Request Unfreeze Item

// login and register
app.post('/api/register', register);
app.post('/api/login', login );

app.all('*', (req, res) => {
  res.json(httpUtil.getNotFound());
});

export { app };
