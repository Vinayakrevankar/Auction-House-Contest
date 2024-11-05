import { GetCommand } from "@aws-sdk/lib-dynamodb";

export const getUser = async (client, emailId) => {
  const params = {
    TableName: 'dev-users3',
    Key: {
      id: emailId
    }
  };

  try {
    const command = new GetCommand(params);
    const response = await client.send(command);
    return response.Item;
  } catch (err) {  
    console.log("Error in getUser", err);
    throw err;
  }
};