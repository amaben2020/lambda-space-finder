import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  Code,
  Function as LambdaFunction,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

// this stack would hold the table
export class LambdaStack extends Stack {
  public readonly helloLambdaIntegration: LambdaIntegration;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const helloLambda = new LambdaFunction(this, 'HelloLambda', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'hello.main',
      code: Code.fromAsset(join(__dirname, '..', 'services')),
    });

    this.helloLambdaIntegration = new LambdaIntegration(helloLambda);
  }
}
