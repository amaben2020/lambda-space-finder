//@ts-nocheck

import { SNSEvent } from 'aws-lambda';
import { handler } from '../services/monitor/handler';
const SnsEvent: SNSEvent = {
  Records: [
    {
      Sns: {
        Message: 'This is a critical error',
      },
    },
  ],
};

handler(SnsEvent, {});
