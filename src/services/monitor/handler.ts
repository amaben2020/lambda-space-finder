import { Context, SNSEvent } from 'aws-lambda';
import axios from 'axios';
const webhookUrl =
  'https://hooks.slack.com/services/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';

async function handler(event: SNSEvent, context) {
  for (const {
    Sns: { Message },
  } of event.Records) {
    try {
      await axios.post(
        webhookUrl,
        {
          text: Message,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
}

export { handler };
