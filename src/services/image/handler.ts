import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // const { image, filename, userId } = JSON.parse(event.body || '{}');

  // if (!image || !filename || !userId) {
  //   return { statusCode: 400, body: 'Missing parameters' };
  // }

  // const bucketName = process.env.BUCKET_NAME!;
  // const db = await getDbConnection();

  return {
    statusCode: 200,
    body: '',
  };
};
