provider "aws" {
  region = "us-east-1"  # Change to your desired region
}

resource "aws_iam_role" "lambda_role" {
  name = "lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Effect = "Allow"
        Sid    = ""
      }
    ]
  })
}

resource "aws_lambda_function" "my_lambda" {
  function_name = "my_lambda_function"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.lambda_handler"  # Update based on your handler file
  runtime       = "nodejs21.x"               # Updated runtime to Node.js 21
  filename      = "backend/lambda_function/lambda_function.zip"      # The ZIP file for your Lambda function
  source_code_hash = filebase64sha256("backend/lambda_function/lambda_function.zip")

  environment {
    # Add environment variables here if needed
    variables = {
      VARIABLE_NAME = "value1"
    }
  }
  timeout     = 30
  memory_size = 128

  tags = {
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}

# Create the API Gateway REST API
resource "aws_api_gateway_rest_api" "action-house-api" {
  name        = "action-house-api"
  description = "API Gateway for my Lambda function"
}

# Create a resource (endpoint) in the API Gateway
resource "aws_api_gateway_resource" "my_resource" {
  rest_api_id = aws_api_gateway_rest_api.action-house-api.id
  parent_id   = aws_api_gateway_rest_api.action-house-api.root_resource_id
  path_part   = "myendpoint"  # The path for the endpoint
}

# Create a method (e.g., GET) for the resource
resource "aws_api_gateway_method" "my_method" {
  rest_api_id   = aws_api_gateway_rest_api.action-house-api.id
  resource_id   = aws_api_gateway_resource.my_resource.id
  http_method   = "GET"  # Change to the desired HTTP method
  authorization = aws_api_gateway_authorizer.custom_authorizer.name  # Use the custom authorizer
}

# Create the integration with the Lambda function
resource "aws_api_gateway_integration" "my_integration" {
  rest_api_id             = aws_api_gateway_rest_api.action-house-api.id
  resource_id             = aws_api_gateway_resource.my_resource.id
  http_method             = aws_api_gateway_method.my_method.http_method
  integration_http_method = "POST"  # Lambda integration method
  type                    = "AWS_PROXY"  # Use AWS_PROXY for Lambda integration

  uri = aws_lambda_function.my_lambda.invoke_arn
}

# Add a permission for API Gateway to invoke the Lambda function
resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.my_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # The source ARN must match the API Gateway endpoint
  source_arn = "${aws_api_gateway_rest_api.action-house-api.execution_arn}/*/*"
}

# Create the custom authorizer Lambda function
resource "aws_lambda_function" "custom_authorizer" {  # Renamed from my_authorizer to custom_authorizer
  function_name = "custom_authorizer_function"
  role          = aws_iam_role.lambda_role.arn
  handler       = "authorizer.handler"  # Update based on your authorizer handler file
  runtime       = "nodejs21.x"            # Updated runtime to Node.js 21
  filename      = "backend/custom-authorizer/custom-authorizer.zip"  # The ZIP file for your authorizer function
  source_code_hash = filebase64sha256("backend/custom-authorizer/custom-authorizer.zip")

  environment {
    # Add environment variables for the authorizer if needed
  }
  timeout     = 30
  memory_size = 128

  tags = {
    Environment = "dev"
    ManagedBy   = "terraform"
  }
}

# Create the API Gateway Authorizer
resource "aws_api_gateway_authorizer" "custom_authorizer" {  # Renamed from my_authorizer to custom_authorizer
  rest_api_id = aws_api_gateway_rest_api.action-house-api.id
  name        = "custom_authorizer"  # Updated to match the new name
  type        = "REQUEST"
  
  authorizer_uri = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${aws_lambda_function.custom_authorizer.arn}/invocations"
  
  identity_source = "method.request.header.Authorization"  # The header to use for authentication

  # Optional: Set the authorizer TTL
  authorizer_result_ttl_in_seconds = 300
}

# Attach the authorizer to the method
resource "aws_api_gateway_method_settings" "my_method_settings" {
  rest_api_id = aws_api_gateway_rest_api.action-house-api.id
  stage_name  = aws_api_gateway_deployment.my_deployment.stage_name
  method_path = "${aws_api_gateway_resource.my_resource.path_part}/${aws_api_gateway_method.my_method.http_method}"

  settings {
    logging_level = "INFO"
    metrics_enabled = true
  }
}

# Create a deployment for the API Gateway
resource "aws_api_gateway_deployment" "my_deployment" {
  depends_on = [
    aws_api_gateway_integration.my_integration,
    aws_api_gateway_method.my_method,
    aws_api_gateway_authorizer.custom_authorizer  # Updated to the new authorizer name
  ]

  rest_api_id = aws_api_gateway_rest_api.action-house-api.id
  stage_name  = "dev"  # The deployment stage name
}
