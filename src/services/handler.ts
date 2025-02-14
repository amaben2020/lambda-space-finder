import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { postSpaces } from './spaces/PostSpaces';
import { getSpaces } from './spaces/GetSpaces';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { MissingFieldError } from './shared/validator';

const ddbClient = new DynamoDBClient({});

// TODO: we can extract the handler later

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log(event.httpMethod);

  try {
    switch (event.httpMethod) {
      case 'GET':
        const result = await getSpaces(event, ddbClient);
        console.log(result);
        return result;

      case 'POST':
        const response = await postSpaces(event, ddbClient);
        console.log('response', response);
        return response;

      default:
        throw Error('Something went terribly wrong');
    }
  } catch (error) {
    if (error instanceof MissingFieldError) {
      return {
        statusCode: 400,
        body: error.message,
      };
    }
  }
}

export { handler };
