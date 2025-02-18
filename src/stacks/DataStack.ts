import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../utils';
import { BlockPublicAccess, Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import {
  InstanceClass,
  InstanceType,
  InstanceSize,
  SecurityGroup,
  SubnetType,
  Vpc,
} from 'aws-cdk-lib/aws-ec2';
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
} from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { monotonicFactory } from 'ulid';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'node:path';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

const ulid = monotonicFactory();

// this stack would hold the dynamodb table
export class DataStack extends Stack {
  public readonly spacesTable;
  // public readonly s3Bucket;
  public readonly database: DatabaseInstance;
  public readonly dbSecret: Secret;
  public readonly vpc: Vpc;
  public readonly dbName: string;
  public readonly dbSecurityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    // const vpc = new Vpc(this, 'VpcLambda', {
    //   maxAzs: 2,
    //   subnetConfiguration: [
    //     {
    //       cidrMask: 24,
    //       name: 'privatelambda',
    //       subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    //     },
    //     {
    //       cidrMask: 24,
    //       name: 'public',
    //       subnetType: SubnetType.PUBLIC,
    //     },
    //   ],
    // });

    // const dbSecurityGroup = new SecurityGroup(this, 'DbSecurityGroup', {
    //   vpc,
    // });

    // const databaseName = 'spacespostgresdb';

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

    // this.database = dbInstance;
    // this.vpc = vpc;
    // this.dbName = databaseName;
    // this.dbSecurityGroup = dbSecurityGroup;

    // DynamoDB
    this.spacesTable = new Table(this, 'SpacesTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: `SpaceTable-${suffix}`,
    });

    // this.s3Bucket = new Bucket(this, 'ImageBucket', {
    //   bucketName: 'images-bucket',
    //   removalPolicy: RemovalPolicy.DESTROY,
    //   blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    // });

    const bucketId = ulid().toLowerCase();
    const isProd = process.env.isProd ?? false;
    const isDev = !isProd;
    const removalPolicy = isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN;

    const bucket = new Bucket(this, 'S3Bucket', {
      bucketName: `aws-lambda-s3-${bucketId}`,
      autoDeleteObjects: isDev, // AWS CDK will create additional lambda automatically which will delete the objects of S3 bucket when we destroy the stack or when there is any change to the bucket name
      removalPolicy,
    });

    // TODO: Move to LambdaStack once its working fine
    const nodeJsFunctionProps: NodejsFunctionProps = {
      runtime: Runtime.NODEJS_LATEST,
      timeout: Duration.minutes(3), // Default is 3 seconds
      memorySize: 256,
    };

    const readS3ObjFn = new NodejsFunction(this, 'readS3Obj', {
      entry: join(__dirname, '..', 'lambdas', 'read-s3-obj.ts'),
      ...nodeJsFunctionProps,
      functionName: 'readS3Obj',
      environment: {
        bucketName: bucket.bucketName,
      },
    });

    // lambda is invoked automatically when s3 file is uploaded
    readS3ObjFn.addEventSource(
      new S3EventSource(bucket, {
        events: [EventType.OBJECT_CREATED],
      })
    );

    // readS3ObjPrefixFn.addEventSource(
    //   new S3EventSource(bucket, {
    //     events: [s3.EventType.OBJECT_CREATED],
    //     filters: [{ prefix: 'sales/' }],
    //   })
    // );

    const writeS3ObjFn = new NodejsFunction(this, 'writeS3ObjFn', {
      entry: join(__dirname, '..', 'lambdas', 'write-s3-obj.ts'),
      ...nodeJsFunctionProps,
      functionName: 'writeS3ObjFn',
      environment: {
        bucketName: bucket.bucketName,
      },
    });

    // Store S3 bucket name in Parameter Store
    new StringParameter(this, 'S3BucketNameParameter', {
      parameterName: `/datastack/s3-bucket-name`,
      stringValue: bucket.bucketName,
    });

    // this.s3Bucket = bucket;

    bucket.grantWrite(writeS3ObjFn);
    bucket.grantRead(readS3ObjFn);
  }
}
