import { App } from 'aws-cdk-lib';
import { DataStack } from '../stacks/DataStack';
import { LambdaStack } from '../stacks/LambdaStack';
import { ApiStack } from '../stacks/ApiStack';
import { AuthStack } from '../stacks/AuthStack';

const app = new App();

const dataStack = new DataStack(app, 'DataStack');
const authStack = new AuthStack(app, 'AuthStack');
const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  spacesTable: dataStack.spacesTable,
  auth: {
    userPool: authStack.userPool,
    userPoolClient: authStack.userPoolClient,
    authorizer: authStack.authorizer,
  },
});
new ApiStack(app, 'ApiStack', {
  integrations: lambdaStack.integrations,
  // authorizer: authStack.authorizer,
  authorizer: lambdaStack.integrations.authorizer,
});
