# CS509 Auction House

Application URL: [https://vinayakrevankar.com/Auction-House-Contest/](https://vinayakrevankar.com/Auction-House-Contest/)

## Directories & files

- `frontend/`: Frontend React app.
- `backend/`: AWS Lambda Deployment Files.
- `spec.yaml`: OpenAPI schema.
- `serverless.yml`: Configuration file for deploying AWS Lambda functions and S3.
- `.github/workflows/`: Automates deployment for both client and server, and sends commit and merge notifications to discord.

## Iteration 2 implemented use cases

- Seller
  - backend:
    - Publish / Unpublish: Added additional check conditions.
  - frontend:
    - Close account
    - Fulfill Item
    - Publish / Unpublish: Added additional check conditions.
    - Archive Item
    - Request Unfreeze
- Customer
  - View items
- Buyer
  - backend:
    - Close account
    - Add funds
    - View Item
    - Place Bids
    - Review Active Bids
    - Review Purchases
  - frontend:
    - Close account
    - Add funds
    - View Item
    - Place Bids
    - Review Active Bids
    - Review Purchases

## Iteration 1 implemented use cases

- Seller
  - backend: All use cases for seller
  - frontend:
    - Login Account
    - Create Account
    - Add items
    - Edit items
    - Review items
    - Publish / Unpublish items
- Buyer
  - backend:
    - Login Account
    - Create Account
  - frontend:
    - Login Account
    - Create Account
