import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

export async function postSpaces(
  event: APIGatewayProxyEvent,
  ddbClient: DynamoDBClient
) {}
