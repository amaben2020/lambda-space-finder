import { createConnection } from 'mysql2/promise';
import * as process from 'process';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

// Fetch DB credentials from AWS Secrets Manager
async function getDbCredentials() {
  const secretName = process.env.DB_SECRET_ARN!;
  const client = new SecretsManagerClient({ region: 'us-east-1' });

  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretName })
  );
  if (!response.SecretString)
    throw new Error('Could not retrieve database credentials');

  return JSON.parse(response.SecretString);
}

// Create database connection
export async function getDbConnection() {
  const credentials = await getDbCredentials();

  return createConnection({
    host: process.env.DB_HOST!,
    user: credentials.username,
    password: credentials.password,
    database: process.env.DB_NAME!,
    ssl: { rejectUnauthorized: true }, // Ensures a secure connection
  });
}
