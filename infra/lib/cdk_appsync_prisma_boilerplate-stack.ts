import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as rds from '@aws-cdk/aws-rds';
import * as iam from '@aws-cdk/aws-iam';
import { lambdaLayersConfig } from './helpers/lambdaLayersConfig';
import * as cognito from '@aws-cdk/aws-cognito';
// import { CfnInternetGateway, CfnVPCGatewayAttachment } from '@aws-cdk/aws-ec2';

const resolvers = [
  { typeName: 'Query', fieldName: 'listUsers' },
  // { typeName: 'Query', fieldName: 'getPostById' },
  { typeName: 'Mutation', fieldName: 'createUser' },
  // { typeName: 'Mutation', fieldName: 'updatePost' },
  // { typeName: 'Mutation', fieldName: 'deletePost' },
];

class CdkAppsyncPrismaBoilerplateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = this.createCognitoUserPool();
    const userPoolClient = this.createCognitoUserPoolClient(userPool);
 

    // Create the AppSync API
    const api = this.CreateAppSync();

    // Create the VPC needed for the Aurora Serverless DB cluster
    const { vpc, privateSg } = this.CreateVpcAndSecurityGroup();

    // const cluster = this.CreateServerlessAurora(vpc, privateSg)

    // this.CreateBastionEc2(vpc, privateSg);

    const lambdaLayers: lambda.LayerVersion[] = this.createLambdaLayers();

    // Create the Lambda functions for each resolver
    this.CreateResolverFunctions({
      vpc,
      privateSg,
      lambdaLayers,
      // cluster,
      api,
    });

    // 👇 Outputs
    new cdk.CfnOutput(this, 'userPoolId', {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'userPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'AppSyncAPIURL', {
      value: api.graphqlUrl,
    });
    new cdk.CfnOutput(this, 'AppSyncAPIKey', {
      value: api.apiKey || '',
    });
  }


  private createCognitoUserPool() {
    // 👇 User Pool
    const userPool = new cognito.UserPool(this, 'userpool', {
      userPoolName: 'my-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        country: new cognito.StringAttribute({ mutable: true }),
        city: new cognito.StringAttribute({ mutable: true }),
        isAdmin: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    return userPool;
  }

  private createCognitoUserPoolClient(userPool: cognito.UserPool) {
    // 👇 User Pool Client attributes
    const standardCognitoAttributes = {
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
      address: true,
      birthdate: true,
      gender: true,
      locale: true,
      middleName: true,
      fullname: true,
      nickname: true,
      phoneNumber: true,
      phoneNumberVerified: true,
      profilePicture: true,
      preferredUsername: true,
      profilePage: true,
      timezone: true,
      lastUpdateTime: true,
      website: true,
    };

    const clientReadAttributes = new cognito.ClientAttributes()
      .withStandardAttributes(standardCognitoAttributes)
      .withCustomAttributes(...['country', 'city', 'isAdmin']);

    const clientWriteAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        ...standardCognitoAttributes,
        emailVerified: false,
        phoneNumberVerified: false,
      })
      .withCustomAttributes(...['country', 'city']);

    // // 👇 User Pool Client
    const userPoolClient = new cognito.UserPoolClient(this, 'userpool-client', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });
    return userPoolClient;
  }


  private createLambdaLayers() {
    const lambdaLayers: lambda.LayerVersion[] = [];
    for (let i = 0; i < Object.keys(lambdaLayersConfig).length; i += 1) {
      const layerName = Object.keys(lambdaLayersConfig)[i];
      const layerConfig = lambdaLayersConfig[layerName];
      const lambdaLayerAws = new lambda.LayerVersion(this, layerName, {
        code: lambda.Code.fromAsset(layerConfig.assetPath),
        compatibleRuntimes: [
          lambda.Runtime.NODEJS_12_X,
          lambda.Runtime.NODEJS_14_X,
        ],
        description: layerConfig.description,
      });
      lambdaLayers.push(lambdaLayerAws);
    }
    return lambdaLayers;
  }

  private CreateResolverFunctions({
    vpc,
    privateSg,
    lambdaLayers,
    cluster,
    api,
  }: {
    vpc: ec2.Vpc;
    privateSg: ec2.SecurityGroup;
    cluster?: rds.ServerlessCluster;
    lambdaLayers: lambda.LayerVersion[];
    api: appsync.GraphqlApi;
  }) {
    new ec2.InterfaceVpcEndpoint(this, 'secrets-manager', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      vpc,
      privateDnsEnabled: true,
      subnets: { subnetType: ec2.SubnetType.PRIVATE },
      securityGroups: [privateSg],
    });

    // Map the resolvers to the Lambda function
    for (const { typeName, fieldName } of resolvers) {
      const postFn = new lambda.Function(this, fieldName, {
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
        securityGroups: [privateSg],
        runtime: lambda.Runtime.NODEJS_14_X,
        layers: lambdaLayers,
        code: new lambda.AssetCode(`../build/lambdas/${fieldName}`),
        handler: 'index.handler',
        memorySize: 1024,
        timeout: cdk.Duration.seconds(10),
        environment: {
          // SECRET_ID: cluster.secret?.secretArn || '',
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
          DATABASE_URL:
            'mysql://goldware:gd0xzjnbwj5040ct@sales-circle-extra-do-user-6343648-0.b.db.ondigitalocean.com:25060/cronjobs',
        },
      });

      // Grant access to Secrets manager to fetch the secret
      postFn.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['secretsmanager:GetSecretValue'],
          resources: [cluster?.secret?.secretArn || '*'],
        }),
      );

      // Grant access to the cluster from the Lambda function
      // cluster.grantDataApiAccess(postFn)
      // Set the new Lambda function as a data source for the AppSync API
      const lambdaDs = api.addLambdaDataSource(
        `${fieldName}_lambdaDatasource`,
        postFn,
      );

      lambdaDs.createResolver({ typeName, fieldName });
    }
  }

  // private CreateServerlessAurora(vpc: ec2.Vpc, privateSg: ec2.SecurityGroup) {
  //  // RDS Subnet Group
  //   const subnetGroup = new rds.SubnetGroup(this, 'rds-subnet-group', {
  //     vpc,
  //     subnetGroupName: 'aurora-subnet-group',
  //     vpcSubnets: { subnetType: ec2.SubnetType.ISOLATED },
  //     removalPolicy: cdk.RemovalPolicy.DESTROY,
  //     description: 'An all private subnets group for the DB',
  //   });

  //   // Create the Serverless Aurora DB cluster
  //   const cluster = new rds.ServerlessCluster(this, 'AuroraBlogCluster', {
  //     engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
  //     // Set the engine to Postgres
  //     parameterGroup: rds.ParameterGroup.fromParameterGroupName(
  //       this,
  //       'ParameterGroup',
  //       'default.aurora-postgresql10',
  //     ),
  //     defaultDatabaseName: 'BlogDB',
  //     enableDataApi: true,
  //     vpc,
  //     subnetGroup,
  //     securityGroups: [privateSg],
  //     removalPolicy: cdk.RemovalPolicy.DESTROY,
  //   });
  //   return cluster;
  // }

  private CreateVpcAndSecurityGroup() {
    const vpc = new ec2.Vpc(this, 'CdkVPC', {
      cidr: '100.0.0.0/16',
      natGateways: 1,
      maxAzs: 1,
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
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
      ],
    });
    // const igw = new CfnInternetGateway(this, 'InternetGateway');
    // new CfnVPCGatewayAttachment(this, 'VpcGatewayAttachment', {
    //   vpcId: vpc.vpcId,
    //   internetGatewayId: igw.ref,
    // });

    // Create the required security group
    const privateSg = new ec2.SecurityGroup(this, 'private-sg-1', {
      vpc,
      securityGroupName: 'private-sg-1',
    });
    privateSg.addIngressRule(
      privateSg,
      ec2.Port.allTraffic(),
      'allow internal SG access',
    );
    return { vpc, privateSg };
  }

  private CreateAppSync() {
    return new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-blog-appsync-api',
      schema: appsync.Schema.fromAsset('../api/graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    });
  }

  // private CreateBastionEc2(vpc: ec2.Vpc, privateSg: ec2.SecurityGroup) {
  //   // Fetch the latest Ubuntu AMI
  //   const ami = new ec2.LookupMachineImage({
  //     name: 'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*',
  //     filters: { 'virtualization-type': ['hvm'] },
  //     // Canonical AWS Account ID
  //     owners: ['099720109477'],
  //   });

  //   // EC2 instance and public Security Group
  //   const publicSg = new ec2.SecurityGroup(this, 'public-sg', {
  //     vpc,
  //     securityGroupName: 'public-sg',
  //   });
  //   publicSg.addIngressRule(
  //     ec2.Peer.anyIpv4(),
  //     ec2.Port.tcp(22),
  //     'allow SSH access',
  //   );

  //   privateSg.addIngressRule(
  //     publicSg,
  //     ec2.Port.tcp(5432),
  //     'allow Aurora Serverless Postgres access',
  //   );

  //   new ec2.Instance(this, 'jump-box', {
  //     vpc,
  //     securityGroup: publicSg,
  //     vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
  //     instanceType: ec2.InstanceType.of(
  //       ec2.InstanceClass.T2,
  //       ec2.InstanceSize.MICRO,
  //     ),
  //     machineImage: ec2.MachineImage.genericLinux({
  //       [this.region]: ami.getImage(this).imageId,
  //     }),
  //     keyName: this.node.tryGetContext('keyName'),
  //   });
  // }
}

export const prepareStack = async () => {
  console.log('prepareStack ...');
  for (let i = 0; i < Object.keys(lambdaLayersConfig).length; i += 1) {
    const layerName = Object.keys(lambdaLayersConfig)[i];
    const layerConfig = lambdaLayersConfig[layerName];
    if (layerConfig.prepare) {
      await layerConfig.prepare();
    }
  }
};

export const createStack = async ({app,mainStackName}: {app: cdk.App, mainStackName:string}) => {
  console.log('createStack ...');
  return new CdkAppsyncPrismaBoilerplateStack(
    app,
    mainStackName,
    {
      /* If you don't specify 'env', this stack will be environment-agnostic.
       * Account/Region-dependent features and context lookups will not work,
       * but a single synthesized template can be deployed anywhere. */

      /* Uncomment the next line to specialize this stack for the AWS Account
       * and Region that are implied by the current CLI configuration. */
      // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

      /* Uncomment the next line if you know exactly what Account and Region you
       * want to deploy the stack to. */
      env: { account: '945731703827', region: 'ap-northeast-1' },

      /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
    },
  );
};

export const clearDeployment = async () => {
  console.log('clearDeployment ...');
};
