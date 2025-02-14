import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { postSpaces } from './spaces/PostSpaces';
import { getSpaces } from './spaces/GetSpaces';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

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
        const result = await getSpaces(event, ddbClient);

        return result;

      case 'POST':
        const response = await postSpaces(event, ddbClient);
        return response;

      default:
        break;
    }
  } catch (error) {
    console.log(error);
  }
}

export { handler };
