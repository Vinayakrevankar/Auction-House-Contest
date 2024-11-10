# CS509 Auction House

Application URL: [https://vinayakrevankar.com/Auction-House-Contest/](https://vinayakrevankar.com/Auction-House-Contest/)

## Directories & files

- `frontend/`: Frontend React app.
- `backend/`: AWS Lambda Deployment Files.
- `spec.yaml`: OpenAPI schema.
- `serverless.yml`: Configuration file for deploying AWS Lambda functions and S3.
- `.github/workflows/`: Automates deployment for both client and server, and sends commit and merge notifications to discord.

## Implemented use cases

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
