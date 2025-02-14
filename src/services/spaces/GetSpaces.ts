import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 } from 'uuid';

export async function getSpaces(
  event: APIGatewayProxyEvent,
  ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const result = await ddbClient.send(
    new ScanCommand({
      TableName: process.env.TABLE_NAME!,
    })
  );

  console.log('RESULT ===> ', result);

  return {
    statusCode: 201,
    body: JSON.stringify({ result: result.Items }),
  };
}
