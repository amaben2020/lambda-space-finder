import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// we need to make this reusable in an ApiHandler wrapper that returns status and body correctly
async function handler(event: APIGatewayProxyEvent, context: Context) {
  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify(`Hello World ${process.env.TABLE_NAME}`),
  };
}

export { handler };
