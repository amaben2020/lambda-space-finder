import { handler } from '../services/handler';

process.env.AWS_REGION = 'eu-west-1';
process.env.TABLE_NAME = 'SpaceTable-0a2b6a31cc59';

handler(
  {
    httpMethod: 'GET',
    queryStringParameters: {
      id: 'a81ce7af-5d99-4f45-98ba-0d755ce43eec',
    },
  } as any,
  {} as any
);
