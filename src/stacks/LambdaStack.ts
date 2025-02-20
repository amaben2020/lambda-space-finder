import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { type UserPoolClient, type UserPool } from 'aws-cdk-lib/aws-cognito';
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  DatabaseProxy,
  PostgresEngineVersion,
  ProxyTarget,
} from 'aws-cdk-lib/aws-rds';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

interface LambdaStackProps extends StackProps {
  spacesTable: ITable;
  auth: {
    userPool: UserPool;
    userPoolClient: UserPoolClient;
  };
  // s3Bucket: Bucket;
  // database: DatabaseInstance;
  // vpc: Vpc;
  // dbName: string;
  // dbSecurityGroup: SecurityGroup;
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
    // rdsLambda: LambdaIntegration;
    lambdaFn: LambdaIntegration;
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
        actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:ScanItem'],
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

    // const lambdaSG = new SecurityGroup(this, 'LambdaSG', {
    //   vpc: props.vpc,
    // });

    // props.dbSecurityGroup.addIngressRule(
    //   lambdaSG,
    //   Port.tcp(5432),
    //   'Lambda to Postgres database'
    // );

    // const rdsLambdaFn = new NodejsFunction(this, 'rdsLambdaFn', {
    //   entry: join(__dirname, '..', 'lambdas', 'rds-lambda.ts'),
    //   // ...nodeJsFunctionProps,
    //   functionName: 'rdsLambdaFn',
    //   environment: {
    //     DB_ENDPOINT_ADDRESS: props.database.dbInstanceEndpointAddress,
    //     DB_NAME: props.dbName,
    //     DB_SECRET_ARN: props.database.secret?.secretFullArn || '',
    //   },
    //   vpc: props.vpc,
    //   vpcSubnets: props.vpc.selectSubnets({
    //     subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    //   }),
    //   securityGroups: [lambdaSG],
    // });

    // // permission to the lambda
    // props.database.secret?.grantRead(rdsLambdaFn);
    const databaseName = 'spacespostgresdb';

    const vpc = new Vpc(this, 'VpcLambda', {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'privatelambda',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'public',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });

    // const dbSecurityGroup = new SecurityGroup(this, 'DbSecurityGroup', {
    //   vpc,
    // });

    // const lambdaSG = new SecurityGroup(this, 'LambdaSG', {
    //   vpc: vpc,
    // });

    // dbSecurityGroup.addIngressRule(
    //   lambdaSG,
    //   Port.tcp(5432),
    //   'Lambda to Postgres database'
    // );

    // const dbInstance = new DatabaseInstance(this, 'Instance', {
    //   engine: DatabaseInstanceEngine.postgres({
    //     version: PostgresEngineVersion.VER_13,
    //   }),
    //   // optional, defaults to m5.large
    //   instanceType: InstanceType.of(
    //     InstanceClass.BURSTABLE3,
    //     InstanceSize.SMALL
    //   ),
    //   vpc,
    //   vpcSubnets: vpc.selectSubnets({
    //     subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    //   }),
    //   databaseName,
    //   securityGroups: [dbSecurityGroup],
    //   credentials: Credentials.fromGeneratedSecret('postgres'),
    //   maxAllocatedStorage: 200,
    // });

    // const dbProxy = new DatabaseProxy(this, 'Proxy', {
    //   proxyTarget: ProxyTarget.fromInstance(dbInstance),
    //   secrets: [dbInstance.secret!],
    //   securityGroups: [dbSecurityGroup],
    //   vpc,
    //   requireTLS: false,
    //   vpcSubnets: vpc.selectSubnets({
    //     subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    //   }),
    // });

    // const rdsLambdaFn = new NodejsFunction(this, 'rdsLambdaFn', {
    //   entry: join(__dirname, '..', 'lambdas', 'rds-lambda.ts'),
    //   // ...nodeJsFunctionProps,
    //   functionName: 'rdsLambdaFn',
    //   environment: {
    //     // DB_ENDPOINT_ADDRESS: dbInstance.dbInstanceEndpointAddress,
    //     DB_ENDPOINT_ADDRESS: dbProxy.endpoint,
    //     DB_NAME: databaseName,
    //     DB_SECRET_ARN: dbInstance.secret?.secretFullArn || '',
    //   },
    //   vpc: vpc,
    //   vpcSubnets: vpc.selectSubnets({
    //     subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    //   }),
    //   securityGroups: [lambdaSG],
    // });

    // // permission to the lambda
    // dbInstance.secret?.grantRead(rdsLambdaFn);

    // Fetch the S3 bucket name from Parameter Store
    const s3BucketName = StringParameter.valueForStringParameter(
      this,
      '/datastack/s3-bucket-name'
    );

    console.log(s3BucketName);

    // Use the S3 bucket in this stack
    const s3Bucket = Bucket.fromBucketName(this, 'S3Bucket', s3BucketName);

    // CRUD Lambda:
    const lambdaFn = new NodejsFunction(this, 'S3CrudLambda', {
      entry: join(__dirname, '..', 'lambdas', 's3Crud.ts'),
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.minutes(1),
      memorySize: 256,
      functionName: 'S3CrudLambda',
      environment: {
        BUCKET_NAME: s3Bucket.bucketName,
      },
    });

    const lambdaS3Policy = new PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
      resources: [`${s3Bucket.bucketArn}/*`], // Grant access to all objects inside the bucket
    });

    lambdaFn.addToRolePolicy(lambdaS3Policy);
    //  OR  //
    // props.s3Bucket.grantReadWrite(lambdaFn);

    // 📌 Store Lambda Integrations
    this.integrations = {
      spaces: new LambdaIntegration(spacesLambda),
      signup: new LambdaIntegration(signupLambda),
      confirm: new LambdaIntegration(confirmLambda),
      signin: new LambdaIntegration(signinLambda),
      secret: new LambdaIntegration(secretLambda),
      image: new LambdaIntegration(imageLambda),
      // rdsLambda: new LambdaIntegration(rdsLambdaFn),
      lambdaFn: new LambdaIntegration(lambdaFn),
    };
  }
}
