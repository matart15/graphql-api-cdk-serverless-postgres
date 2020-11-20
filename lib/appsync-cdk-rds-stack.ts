import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as appsync from '@aws-cdk/aws-appsync'
import * as lambda from '@aws-cdk/aws-lambda'
import * as rds from '@aws-cdk/aws-rds'

export class AppsyncCdkRdsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create the AppSync API
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-blog-appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    })

    // Create the VPC needed for the Aurora Serverless DB cluster
    const vpc = new ec2.Vpc(this, 'BlogAppVPC', {
      cidr: '10.0.0.0/20',
      natGateways: 0,
      maxAzs: 2,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          cidrMask: 22,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 22,
          name: 'private',
          subnetType: ec2.SubnetType.ISOLATED,
        },
      ],
    })

    // Create the required security groups
    const publicSg = new ec2.SecurityGroup(this, 'public-sg', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'public-sg',
    })

    const privateSg = new ec2.SecurityGroup(this, 'private-sg', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'private-sg',
    })
    privateSg.addIngressRule(
      publicSg,
      ec2.Port.allTraffic(),
      'allow access to all private resources'
    )
    privateSg.addIngressRule(
      privateSg,
      ec2.Port.allTraffic(),
      'allow internal SG access'
    )

    // RDS Subnet Group
    const subnetGroup = new rds.SubnetGroup(this, 'rds-subnet-group', {
      vpc,
      subnetGroupName: 'rds-subnet-group',
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.ISOLATED }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: 'An all private subnets group',
    })

    // Create the Serverless Aurora DB cluster; set the engine to Postgres
    const cluster = new rds.ServerlessCluster(this, 'AuroraBlogCluster', {
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
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

    // Create the Lambda function that will map GraphQL operations into Postgres
    const postFn = new lambda.Function(this, 'MyFunction', {
      vpc,
      vpcSubnets: vpc.selectSubnets({ subnetType: ec2.SubnetType.PUBLIC }),
      securityGroups: [publicSg],
      allowPublicSubnet: true,
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.AssetCode('lambda-fns'),
      handler: 'index.handler',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      environment: {
        DB_URL: this.node.tryGetContext('dbURL') || '',
        // AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
    })
    // Grant access to the cluster from the Lambda function
    cluster.grantDataApiAccess(postFn)
    // Set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', postFn)

    // Map the resolvers to the Lambda function
    for (let { typeName, fieldName } of resolvers) {
      lambdaDs.createResolver({ typeName, fieldName })
    }

    // CFN Outputs
    new cdk.CfnOutput(this, 'AppSyncAPIURL', {
      value: api.graphqlUrl,
    })
    new cdk.CfnOutput(this, 'AppSyncAPIKey', {
      value: api.apiKey || '',
    })
  }
}

const resolvers = [
  { typeName: 'Query', fieldName: 'listPosts' },
  { typeName: 'Query', fieldName: 'getPostById' },
  { typeName: 'Mutation', fieldName: 'createPost' },
  { typeName: 'Mutation', fieldName: 'updatePost' },
  { typeName: 'Mutation', fieldName: 'deletePost' },
]
