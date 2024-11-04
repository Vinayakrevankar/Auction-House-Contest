import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

interface GetSecurityResponse {
  [key: string]: any; // Adjust this according to your expected response structure
}

export const getUser = async (client: DynamoDBClient, emailId: string): Promise<GetSecurityResponse | undefined> => {
  const params = {
    TableName: 'dev-users2',
    Key: {
      id: { S: emailId }
    }
  };

  const command = new GetCommand(params);
  const response = await client.send(command);
  return response.Item as GetSecurityResponse | undefined;
};
