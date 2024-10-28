provider "aws" {
  region = "us-east-1" # Set your desired AWS region
}

# Create IAM role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "lambda_api_execution_role"
  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement": [
      {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Effect": "Allow"
      }
    ]
  })
}
 
# Attach Lambda Execution Policy to IAM Role
resource "aws_iam_role_policy_attachment" "lambda_execution_policy" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda function
resource "aws_lambda_function" "example_lambda" {
  filename         = "backend/lambda_function/lambda_function.zip" # Path to the Lambda function code
  function_name    = "exampleLambdaFunction"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler" # Handler name, e.g., "index.handler" for index.js
  runtime          = "nodejs18.x"    # Choose the runtime, e.g., Node.js, Python, etc.
  source_code_hash = filebase64sha256("backend/lambda_function/lambda_function.zip")

  # Environment variables (optional)
  environment {
    variables = {
      ENV_VAR = "exampleValue"
    }
  }
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
  integration_uri    = aws_lambda_function.example_lambda.invoke_arn
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
  function_name = aws_lambda_function.example_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.example_api.execution_arn}/*/*"
}
