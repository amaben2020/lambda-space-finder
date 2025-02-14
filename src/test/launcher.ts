import { handler } from '../services/handler';

handler(
  {
    httpMethod: 'POST',
    body: JSON.stringify({ location: 'PARIS' }),
  } as any,
  {} as any
);
