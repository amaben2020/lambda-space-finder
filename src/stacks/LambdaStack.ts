import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { type UserPoolClient, type UserPool } from 'aws-cdk-lib/aws-cognito';

interface LambdaStackProps extends StackProps {
  spacesTable: ITable;
  auth: {
    userPool: UserPool;
    userPoolClient: UserPoolClient;
  };
}

export class LambdaStack extends Stack {
  // all Lambdas
  public readonly integrations: {
    spaces: LambdaIntegration;
    signup: LambdaIntegration;
    confirm: LambdaIntegration;
    signin: LambdaIntegration;
    secret: LambdaIntegration;
    image: LambdaIntegration;
  };

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // 🏢 Spaces Lambda
    const spacesLambda = new NodejsFunction(this, 'SpacesLambda', {
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler',
      entry: join(__dirname, '..', 'services', 'handler.ts'),
      environment: {
        TABLE_NAME: props.spacesTable.tableName,
      },
    });

    spacesLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: [props.spacesTable.tableArn],
        actions: ['dynamodb:PutItem', 'dynamodb:GetItem'],
      })
    );

    // 🏢 Signup Lambda
    const signupLambda = new NodejsFunction(this, 'SignupLambda', {
      entry: join(__dirname, '..', 'services', 'auth', 'signupHandler.ts'),
      runtime: Runtime.NODEJS_22_X,
      handler: 'handler',
      environment: {
        USER_POOL_CLIENT_ID: props.auth.userPoolClient.userPoolClientId,
      },
    });

    signupLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['cognito-idp:SignUp'],
        resources: [props.auth.userPool.userPoolArn],
      })
    );

    // 🏢 Confirm Lambda
    const confirmLambda = new NodejsFunction(this, 'ConfirmLambda', {
      entry: join(__dirname, '..', 'services', 'auth', 'confirmHandler.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      environment: {
        USER_POOL_CLIENT_ID: props.auth.userPoolClient.userPoolClientId,
      },
    });

    confirmLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['cognito-idp:ConfirmSignUp'],
        resources: [props.auth.userPool.userPoolArn],
      })
    );

    // 🏢 Signin Lambda
    const signinLambda = new NodejsFunction(this, 'SigninLambda', {
      entry: join(__dirname, '..', 'services', 'auth', 'signinHandler.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      environment: {
        USER_POOL_CLIENT_ID: props.auth.userPoolClient.userPoolClientId,
      },
    });

    signinLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['cognito-idp:InitiateAuth'],
        resources: [props.auth.userPool.userPoolArn],
      })
    );

    const secretLambda = new NodejsFunction(this, 'secret', {
      entry: join(__dirname, '..', 'services', 'auth', 'secret.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
    });

    const imageLambda = new NodejsFunction(this, 'image', {
      entry: join(__dirname, '..', 'services', 'image', 'handler.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
    });

    // 📌 Store Lambda Integrations
    this.integrations = {
      spaces: new LambdaIntegration(spacesLambda),
      signup: new LambdaIntegration(signupLambda),
      confirm: new LambdaIntegration(confirmLambda),
      signin: new LambdaIntegration(signinLambda),
      secret: new LambdaIntegration(secretLambda),
      image: new LambdaIntegration(imageLambda),
    };
  }
}
