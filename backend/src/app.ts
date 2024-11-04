import 'express-async-errors';

import express, { json } from 'express';
import helmet from 'helmet';
import * as OpenAPIValidator from 'express-openapi-validator';
import { archiveItem, fulfillItem } from './manage-seller/handler';

const app = express();
app.use(json());
app.use(helmet());


app.get('/', (_, res) => {
  res.json({
    msg: 'Hello World',
  });
});

app.get('/prisma', async (_, res) => {
  res.json({
    msg: 'Add a new unique user without duplicate',
  });
});

// See https://cdimascio.github.io/express-openapi-validator-documentation/guide-standard/
// to write handlers.
app.use(OpenAPIValidator.middleware({
  apiSpec: "../../spec.yaml",
  validateRequests: true,
  validateResponses: true,
  validateApiSpec: true,
}));

app.use((_, res, _2) => {
  res.status(404).json({ error: 'NOT FOUND' });
});

// Seller use cases
// Fulfill Item
app.use(
  '/api/sellers/:sellerId/items/:itemId/fulfill',
  (req, res) => fulfillItem(req.params['sellerId'], req.params['itemId'], res),
);
// Archive Item
app.use(
  '/api/sellers/:sellerId/items/:itemId/archive',
  (req, res) => archiveItem(req.params['sellerId'], req.params['itemId'], res),
);
// Request Unfreeze Item

export { app };
