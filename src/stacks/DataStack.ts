import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../utils';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  MysqlEngineVersion,
} from 'aws-cdk-lib/aws-rds';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

// this stack would hold the dynamodb table
export class DataStack extends Stack {
  public readonly spacesTable;
  public readonly spacesBucket;
  public readonly database: DatabaseInstance;
  public readonly dbSecret: Secret;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    // Create VPC for RDS
    const vpc = new Vpc(this, 'ImageAppVPC');
    // Create Secret for DB Credentials
    this.dbSecret = new Secret(this, 'DBSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'admin' }),
        excludePunctuation: true,
        passwordLength: 16,
      },
    });

    // Create RDS Instance
    this.database = new DatabaseInstance(this, 'ImagerDB', {
      engine: DatabaseInstanceEngine.mysql({
        version: MysqlEngineVersion.VER_8_0,
      }),
      vpc,
      credentials: Credentials.fromSecret(this.dbSecret),
      allocatedStorage: 20,
      removalPolicy: RemovalPolicy.DESTROY, // Delete DB on stack removal (for testing)
    });

    // DynamoDB
    this.spacesTable = new Table(this, 'SpacesTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: `SpaceTable-${suffix}`,
    });

    this.spacesBucket = new Bucket(this, 'ImageBucket', {
      bucketName: 'images',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
