import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { postSpaces } from './spaces/PostSpaces';

const ddbClient = new DynamoDBClient({});

// TODO: we can extract the handler later

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  let message: string;

  try {
    switch (event.httpMethod) {
      case 'GET':
        message = 'Hello from GET';
        break;

      case 'POST':
        const response = await postSpaces(event, ddbClient);
        return response;

      default:
        break;
    }
  } catch (error) {
    console.log(error);
  }

  return {
    statusCode: 200,
    body: message,
  };
}

export { handler };
