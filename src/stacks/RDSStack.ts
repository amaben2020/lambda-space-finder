import { aws_apigatewayv2, aws_ec2, Stack, StackProps } from 'aws-cdk-lib';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import {
  AuroraPostgresEngineVersion,
  ClusterInstance,
  Credentials,
  DatabaseCluster,
  DatabaseClusterEngine,
} from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';

export class RdsDataNodejsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new aws_ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
    });

    const dbSecret = new secretsmanager.Secret(this, 'Secret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'master' }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
      },
    });

    const cluster = new DatabaseCluster(this, 'Database', {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_16_4,
      }),
      writer: ClusterInstance.serverlessV2('writerInstance'),
      vpc,
      credentials: Credentials.fromSecret(dbSecret),
      enableDataApi: true,
      serverlessV2MaxCapacity: 6,
      serverlessV2MinCapacity: 0.5,
      defaultDatabaseName: 'postgres',
    });

    const rdsAPIFunction = new NodejsFunction(this, 'RdsAPIFunction', {
      runtime: Runtime.NODEJS_20_X,
      entry: 'lambda/handlers/getItem.ts', // Path to the Lambda function code
      handler: 'handler', // Exported handler function name
      tracing: Tracing.ACTIVE, // Enable X-Ray tracing
      environment: {
        DB_SECRET_ARN: dbSecret.secretArn,
        DB_CLUSTER_ARN: cluster.clusterArn,
        DB_NAME: 'postgres',
        POWERTOOLS_SERVICE_NAME: 'getItemService',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        keepNames: true,
        format: OutputFormat.ESM,
        sourcesContent: true,
        mainFields: ['module', 'main'],
        externalModules: [], // we bundle all the dependencies
        esbuildArgs: {
          '--tree-shaking': 'true',
        },
        // We include this polyfill to support `require` in ESM due to AWS X-Ray SDK for Node.js not being ESM compatible
        banner:
          'import { createRequire } from "module";const require = createRequire(import.meta.url);',
      },
    });

    cluster.grantDataApiAccess(rdsAPIFunction);
    dbSecret.grantRead(rdsAPIFunction);

    const itemsIntegration = new HttpLambdaIntegration(
      'ItemsIntegration',
      rdsAPIFunction
    );

    const httpApi = new aws_apigatewayv2.HttpApi(this, 'ItemsApi');

    httpApi.addRoutes({
      path: '/items/{id}',
      methods: [aws_apigatewayv2.HttpMethod.GET],
      integration: itemsIntegration,
    });
  }
}
