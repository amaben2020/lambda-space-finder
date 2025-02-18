import * as AWS from 'aws-sdk';
import { Client } from 'pg';

export const handler = async (event: any, context: any): Promise<any> => {
  console.log(event);
  try {
    const host = process.env.DB_ENDPOINT_ADDRESS || '';
    console.log(`host:${host}`);
    const database = process.env.DB_NAME || '';
    const dbSecretArn = process.env.DB_SECRET_ARN || '';
    const secretManager = new AWS.SecretsManager({
      region: 'us-east-1',
    });
    const secretParams: AWS.SecretsManager.GetSecretValueRequest = {
      SecretId: dbSecretArn,
    };
    const dbSecret = await secretManager.getSecretValue(secretParams).promise();
    const secretString = dbSecret.SecretString || '';

    if (!secretString) {
      throw new Error('secret string is empty');
    }

    const { password } = JSON.parse(secretString);

    const client = new Client({
      user: 'postgres',
      host,
      database,
      password,
      port: 5432,
    });
    await client.connect();
    const res = await client.query('SELECT $1::text as message', [
      'Hello world!',
    ]);
    console.log(res.rows[0].message); // Hello world!
    await client.end();

    return {
      statusCode: 200,
      body: 'Hey Jude',
    };
  } catch (err) {
    console.log('error while trying to connect to db');
  }
};
