import { Stack, StackProps } from 'aws-cdk-lib';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
  integrations: {
    spaces: LambdaIntegration;
    signup: LambdaIntegration;
    confirm: LambdaIntegration;
    signin: LambdaIntegration;
    secret: LambdaIntegration;
    // rdsLambda: LambdaIntegration;
    lambdaFn: LambdaIntegration;
  };
  userPool: UserPool;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'spacesApi');

    // Create an authorizer based on the user pool
    const authorizer = new CognitoUserPoolsAuthorizer(
      this,
      'myFirstAuthorizer',
      {
        cognitoUserPools: [props.userPool],
        identitySource: 'method.request.header.Authorization',
      }
    );

    authorizer._attachToApi(api);

    const optionsWithAuth: MethodOptions = {
      authorizer: {
        authorizerId: authorizer.authorizerId,
      },
      authorizationType: AuthorizationType.COGNITO,
    };

    // Spaces API
    const spacesResource = api.root.addResource('spaces');
    spacesResource.addMethod('GET', props.integrations.spaces, optionsWithAuth);
    spacesResource.addMethod('POST', props.integrations.spaces);

    // Auth Endpoints
    const authResource = api.root.addResource('auth');
    authResource
      .addResource('signup')
      .addMethod('POST', props.integrations.signup);
    authResource
      .addResource('confirm')
      .addMethod('POST', props.integrations.confirm);
    authResource
      .addResource('signin')
      .addMethod('POST', props.integrations.signin);

    const secretResource = api.root.addResource('secret');
    secretResource.addMethod('GET', props.integrations.secret, optionsWithAuth);

    // const rdsResource = api.root.addResource('rds');
    // rdsResource.addMethod(
    //   'GET',
    //   props.integrations.rdsLambda
    //   // optionsWithAuth
    // );

    const s3Resource = api.root.addResource('s3-lambda');
    s3Resource.addMethod('POST', props.integrations.lambdaFn);
    s3Resource.addMethod('PUT', props.integrations.lambdaFn);
    s3Resource.addMethod('GET', props.integrations.lambdaFn);
    s3Resource.addMethod('DELETE', props.integrations.lambdaFn);
  }
}
