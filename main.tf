terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0" # Specify the AWS provider version
    }
  }

  required_version = ">= 1.0"
}

provider "aws" {
  region = "us-east-1" # Set your desired AWS region
}

# Check if IAM Role already exists (optional)
data "aws_iam_role" "existing_lambda_role" {
  name = "lambda_api_execution_role"
}

# Create IAM role for Lambda if it doesn't exist
resource "aws_iam_role" "lambda_role" {
  count = data.aws_iam_role.existing_lambda_role.id != "" ? 0 : 1
  name  = "lambda_api_execution_role"

  assume_role_policy = jsonencode({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: {
          Service: "lambda.amazonaws.com"
        },
        Effect: "Allow"
      }
    ]
  })
}

# Attach Lambda Execution Policy to IAM Role
resource "aws_iam_role_policy_attachment" "lambda_execution_policy" {
  count      = data.aws_iam_role.existing_lambda_role.id != "" ? 0 : 1
  role       = aws_iam_role.lambda_role[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Check if Lambda function already exists
data "aws_lambda_function" "existing_lambda" {
  function_name = "exampleLambdaFunction"
}

# Lambda function
resource "aws_lambda_function" "example_lambda" {
  count             = data.aws_lambda_function.existing_lambda.id != "" ? 0 : 1
  filename          = "backend/lambda_function/lambda_function.zip" # Path to the Lambda function code
  function_name     = "exampleLambdaFunction"
  role              = data.aws_iam_role.existing_lambda_role.id != "" ? data.aws_iam_role.existing_lambda_role.arn : aws_iam_role.lambda_role[0].arn
  handler           = "index.handler" # Handler name, e.g., "index.handler" for index.js
  runtime           = "nodejs18.x"     # Choose the runtime, e.g., Node.js
  source_code_hash  = filebase64sha256("backend/lambda_function/lambda_function.zip")

  # Environment variables (optional)
  environment {
    variables = {
      ENV_VAR = "exampleValue"
    }
  }

  # Add timeout and memory size for the Lambda function
  timeout      = 30          # Increase the timeout if necessary
  memory_size  = 128         # Set memory size according to your needs
}

# Update existing Lambda function
resource "aws_lambda_update_function_code" "update_lambda" {
  count             = data.aws_lambda_function.existing_lambda.id != "" ? 1 : 0
  function_name     = data.aws_lambda_function.existing_lambda.function_name
  s3_bucket         = "" # If using S3, specify the bucket; else leave empty
  s3_key            = "" # If using S3, specify the object key; else leave empty
  filename          = "backend/lambda_function/lambda_function.zip"
}

# API Gateway
resource "aws_apigatewayv2_api" "example_api" {
  name          = "exampleAPI"
  protocol_type = "HTTP"
}

# Lambda integration for API Gateway
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.example_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.example_lambda[0].invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

# API Gateway route
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.example_api.id
  route_key = "POST /example"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.example_api.id
  name        = "dev"
  auto_deploy = true
}

# Permissions for API Gateway to invoke Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = data.aws_lambda_function.existing_lambda.id != "" ? data.aws_lambda_function.existing_lambda.function_name : aws_lambda_function.example_lambda[0].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.example_api.execution_arn}/*/*"
}

# Output the API Gateway endpoint
output "api_endpoint" {
  value = aws_apigatewayv2_stage.api_stage.invoke_url
}
