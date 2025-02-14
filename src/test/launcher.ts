import { handler } from '../services/handler';

process.env.AWS_REGION = 'eu-west-1';
process.env.TABLE_NAME = 'SpaceTable-0a2b6a31cc59';

handler(
  {
    httpMethod: 'POST',
    body: JSON.stringify({ location: 'Hey', name: 'Ben' }),
  } as any,
  {} as any
).then((res) => console.log(res));
