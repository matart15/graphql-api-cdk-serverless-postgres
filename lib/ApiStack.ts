import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as appsync from '@aws-cdk/aws-appsync'
import * as lambda from '@aws-cdk/aws-lambda'
import * as rds from '@aws-cdk/aws-rds'
import * as iam from '@aws-cdk/aws-iam'
import * as cognito from '@aws-cdk/aws-cognito'

interface ApiStackProps extends cdk.StackProps {
  vpc: ec2.Vpc
  privateSg: ec2.SecurityGroup
  dbCluster: rds.ServerlessCluster
  userPool: cognito.UserPool
}

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    const { vpc, privateSg, dbCluster, userPool } = props

    // Create the AppSync API
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-blog-appsync-api',
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool,
            },
          },
        ],
      },
    })

    // Create the Lambda function that will map GraphQL operations into Postgres
    const postFn = new lambda.Function(this, 'MyFunction', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.ISOLATED },
      securityGroups: [privateSg],
      runtime: lambda.Runtime.NODEJS_14_X,
      code: new lambda.AssetCode('lambda-fns'),
      handler: 'index.handler',
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
      environment: {
        SECRET_ID: dbCluster.secret?.secretArn || '',
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
    })

    // Grant access to Secrets manager to fetch the secret
    postFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:GetSecretValue'],
        resources: [dbCluster.secret?.secretArn || ''],
      })
    )

    // Grant access to the cluster from the Lambda function
    // dbCluster.grantDataApiAccess(postFn)

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
