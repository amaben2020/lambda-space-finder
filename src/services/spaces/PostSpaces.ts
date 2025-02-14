import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 } from 'uuid';
import { validateAsSpaceEntry } from '../shared/validator';

export async function postSpaces(
  event: APIGatewayProxyEvent,
  ddbClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  try {
    const randomId = v4();

    console.log(event.body);

    const item = JSON.parse(event.body);

    validateAsSpaceEntry(item);

    const result = await ddbClient.send(
      new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          id: {
            S: randomId,
          },
          location: {
            S: item.location,
          },
          name: {
            S: item.name,
          },
        },
      })
    );

    console.log('res', result);

    return {
      statusCode: 201,
      body: JSON.stringify({ result }),
    };
  } catch (error) {
    console.log(error);
  }
}
