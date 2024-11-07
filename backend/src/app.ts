import 'express-async-errors';

import express, { json } from 'express';
import helmet from 'helmet';
// import * as OpenAPIValidator from 'express-openapi-validator';
import { archiveItem, fulfillItem, requestUnfreezeItem } from './manage-seller/handler';
// import { addItem, editItem, removeInactiveItem } from './manage-item/handler';
import { registerHandler, loginHander, editProfileHandler } from './manage-user/handler';
import { getActiveItems, getItemBids, getItemDetails, publishItem, reviewItems, unpublishItem } from './manage-item/handler'
import * as httpUtil from './util/httpUtil';
import { authFilterMiddleware } from './security/authFilterMiddleware';
import { asyncMiddleware as _async } from './security/asyncMiddleware';
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
  '/api/sellers/:sellerId/items',authFilterMiddleware,
  (req, res) => addItem(req.params['sellerId'], req.body, res),
);
// Edit Item
app.put(
  '/api/sellers/:sellerId/items/:itemId',authFilterMiddleware,
  (req, res) => editItem(req.params['sellerId'], req.params['itemId'], req.body, res),
);
// Remove Inactive Item
app.delete(
  '/api/sellers/:sellerId/items/:itemId',authFilterMiddleware,
  (req, res) => removeInactiveItem(req.params['sellerId'], req.params['itemId'], res),
);

app.post(
  '/api/sellers/:sellerId/items/:itemId/publish',
  authFilterMiddleware,
  (req, res) => publishItem(req.params['sellerId'], req.params['itemId'], req.body["startDate"], req.body["endDate"], res),
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

// login and register
app.post('/api/register', registerHandler);
app.post('/api/login', loginHander);
app.put('/api/profile/update', editProfileHandler);

app.all('*', (req, res) => {
  res.json(httpUtil.getNotFound());
});

export { app };
