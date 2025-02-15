import * as cdk from 'aws-cdk-lib';
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly userPool;
  public readonly userPoolClient;
  public readonly authorizer;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new cdk.aws_cognito.UserPool(this, 'authUserPool', {
      selfSignUpEnabled: true,
      autoVerify: {
        email: true,
      },
    });

    // FOR UI
    this.userPoolClient = new cdk.aws_cognito.UserPoolClient(
      this,
      'authUserPoolClient',
      {
        userPool: this.userPool,
        authFlows: {
          userPassword: true,
        },
      }
    );
  }
}
