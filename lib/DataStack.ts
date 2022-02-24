import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'

interface DataStackProps extends cdk.StackProps {
  vpc: ec2.Vpc
  privateSg: ec2.SecurityGroup
  subnetGroup: rds.SubnetGroup
}

export class DataStack extends cdk.Stack {
  public readonly dbCluster: rds.ServerlessCluster
  constructor(scope: cdk.Construct, id: string, props: DataStackProps) {
    super(scope, id, props)

    const { vpc, privateSg, subnetGroup } = props

    // Create the Serverless Aurora DB cluster
    this.dbCluster = new rds.ServerlessCluster(this, 'AuroraBlogCluster', {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      // Set the engine to Postgres
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        'ParameterGroup',
        'default.aurora-postgresql10'
      ),
      defaultDatabaseName: 'BlogDB',
      enableDataApi: true,
      vpc,
      subnetGroup,
      securityGroups: [privateSg],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
  }
}
