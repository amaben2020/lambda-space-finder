import { Stack, StackProps } from 'aws-cdk-lib';
import {
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
  integrations: {
    spaces: LambdaIntegration;
    signup: LambdaIntegration;
    confirm: LambdaIntegration;
    signin: LambdaIntegration;
    secret: LambdaIntegration;
  };
  // authorizer: CognitoUserPoolsAuthorizer;
}

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const api = new RestApi(this, 'spacesApi');

    // Spaces API
    const spacesResource = api.root.addResource('spaces');
    spacesResource.addMethod('GET', props.integrations.spaces);
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

    // const secretResource = api.root.addResource('secret');

    // secretResource.addMethod('GET', props.integrations.secret, {
    //   authorizer: props.authorizer,
    //   authorizationType: AuthorizationType.COGNITO,
    // });
  }
}
