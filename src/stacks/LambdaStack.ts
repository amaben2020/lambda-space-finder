import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

// this stack needs to communicate with the Data and Api stacks, you need to send your entire ref to the ApiStack

interface LambdaStackProps extends StackProps {
  spacesTable: ITable;
}

export class LambdaStack extends Stack {
  public readonly spacesLambdaIntegration: LambdaIntegration;
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const spacesLambda = new NodejsFunction(this, 'SpacesLambda', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler', // name of the function definition exported
      entry: join(__dirname, '..', 'services', 'handler.ts'),
      // a way to pass data from one stack to another via env vars,  we are passing it as env to the lambda handlers
      environment: {
        TABLE_NAME: props.spacesTable.tableName,
      },
    });

    // spacesLambda.addToRolePolicy(
    //   new PolicyStatement({
    //     effect: Effect.ALLOW,

    //     actions: ['s3:ListAllMyBuckets', 's3:ListBucket'],
    //     resources: ['*'],
    //   })
    // );

    // enable us connect our lambda to table POST
    spacesLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [props.spacesTable.tableArn],
        actions: [
          'dynamodb:PutItem',
          'dynamodb:GetItem',
          'dynamodb:DeleteItem',
        ],
      })
    );

    this.spacesLambdaIntegration = new LambdaIntegration(spacesLambda);
  }
}
