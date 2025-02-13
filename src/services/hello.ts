import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { v4 } from 'uuid';

// we need to make this reusable in an ApiHandler wrapper that returns status and body correctly
async function handler(event: APIGatewayProxyEvent, context: Context) {
  console.log(event);
  console.log('uuid', v4);

  return {
    statusCode: 200,
    body: JSON.stringify(`Hello World ${process.env.TABLE_NAME}`),
  };
}

export { handler };
