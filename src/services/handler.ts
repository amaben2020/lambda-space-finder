import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
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
        message = 'Hello from POST';
        break;

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
