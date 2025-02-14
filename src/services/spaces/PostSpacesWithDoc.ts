import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 } from 'uuid';

export async function postSpacesWithDoc(
  event: APIGatewayProxyEvent,
  ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const randomId = v4();

  // prevents marshalling
  const ddbClientDoc = DynamoDBDocumentClient.from(ddbClient);
  const item = JSON.parse(event.body);

  item.id = randomId;

  console.log('process.env.TABLE_NAME ===>', process.env.TABLE_NAME);

  const result = await ddbClientDoc.send(
    new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        id: {
          S: item.id,
        },
        location: {
          S: item.location,
        },
      },
    })
  );

  console.log('RESULT ===> ', result);

  return {
    statusCode: 201,
    body: JSON.stringify({ id: randomId }),
  };
}
