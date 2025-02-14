import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';

// we need to make this reusable in an ApiHandler wrapper that returns status and body correctly

// always instantiate outside lambda so when its off, it has a ref to it
const s3Client = new S3Client({});
async function handler(event: APIGatewayProxyEvent, context: Context) {
  console.log(event);

  const command = new ListBucketsCommand({});

  const listBucketsResult = (await s3Client.send(command)).Buckets;
  console.log(listBucketsResult);

  const response = {
    statusCode: 200,
    body: JSON.stringify(`Hello World ${process.env.TABLE_NAME}`),
  };

  return response;
}

export { handler };
