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
  // s3Bucket: dataStack.s3Bucket,
  auth: {
    userPool: authStack.userPool,
    userPoolClient: authStack.userPoolClient,
  },
  // database: dataStack.database,
  // vpc: dataStack.vpc,
  // dbName: dataStack.dbName,
  // dbSecurityGroup: dataStack.dbSecurityGroup,
});
new ApiStack(app, 'ApiStack', {
  integrations: lambdaStack.integrations,
  userPool: authStack.userPool,
});
