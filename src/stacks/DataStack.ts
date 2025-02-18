import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../utils';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
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

// this stack would hold the dynamodb table
export class DataStack extends Stack {
  public readonly spacesTable;
  public readonly spacesBucket;
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

    // this.spacesBucket = new Bucket(this, 'ImageBucket', {
    //   bucketName: 'images-bucket',
    //   removalPolicy: RemovalPolicy.DESTROY,
    //   blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    // });
  }
}
