import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Alarm, Metric, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';
import { join } from 'path';

export class MonitorStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const spacesApi4XXAlarm = new Alarm(this, 'spacesApi4XXAlarm', {
      metric: new Metric({
        metricName: '4xxError',
        namespace: 'AWS/ApiGateway',
        period: Duration.minutes(1),
        statistic: 'Sum',
        unit: Unit.COUNT,
        dimensionsMap: { ApiName: 'spacesApi' },
      }),
      evaluationPeriods: 1,
      threshold: 5,
      alarmName: 'spacesApi4XXAlarm',
    });

    const webHookLambda = new NodejsFunction(this, 'AlarmLambda', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler', // name of the function
      entry: join(__dirname, '..', 'services', 'monitor', 'handler.ts'),
    });

    const alarmTopic = new Topic(this, 'AlarmRTopic', {
      displayName: 'AlarmTopic',
      topicName: 'AlarmTopic',
    });

    alarmTopic.addSubscription(new LambdaSubscription(webHookLambda));

    const topicAction = new SnsAction(alarmTopic);

    spacesApi4XXAlarm.addAlarmAction(topicAction);
    spacesApi4XXAlarm.addOkAction(topicAction);
  }
}
