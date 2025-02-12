import { Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../utils';

// this stack would hold the dynamodb table
export class DataStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    new Table(this, 'SpacesTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      tableName: `SpaceTable-${suffix}`,
    });
  }
}
