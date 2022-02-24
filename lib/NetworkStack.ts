import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as rds from '@aws-cdk/aws-rds'

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc
  public readonly privateSg: ec2.SecurityGroup
  public readonly subnetGroup: rds.SubnetGroup
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create the VPC needed for the Aurora Serverless DB cluster
    this.vpc = new ec2.Vpc(this, 'BlogAppVPC', {
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

    // Create the required security group
    this.privateSg = new ec2.SecurityGroup(this, 'private-sg', {
      vpc: this.vpc,
      securityGroupName: 'private-sg',
    })
    this.privateSg.addIngressRule(
      this.privateSg,
      ec2.Port.allTraffic(),
      'allow internal SG access'
    )

    // Fetch the latest Ubuntu AMI
    // const ami = new ec2.LookupMachineImage({
    //   name: 'ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*',
    //   filters: { 'virtualization-type': ['hvm'] },
    //   // Canonical AWS Account ID
    //   owners: ['099720109477'],
    // })

    // EC2 instance and public Security Group
    // const publicSg = new ec2.SecurityGroup(this, 'public-sg', {
    //   vpc: this.vpc,
    //   securityGroupName: 'public-sg',
    // })
    // publicSg.addIngressRule(
    //   ec2.Peer.anyIpv4(),
    //   ec2.Port.tcp(22),
    //   'allow SSH access'
    // )

    // this.privateSg.addIngressRule(
    //   publicSg,
    //   ec2.Port.tcp(5432),
    //   'allow Aurora Serverless Postgres access'
    // )

    // new ec2.Instance(this, 'jump-box', {
    //    vpc: this.vpc,,
    //   securityGroup: publicSg,
    //   vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    //   instanceType: ec2.InstanceType.of(
    //     ec2.InstanceClass.T2,
    //     ec2.InstanceSize.MICRO
    //   ),
    //   machineImage: ec2.MachineImage.genericLinux({
    //     [this.region]: ami.getImage(this).imageId,
    //   }),
    //   keyName: this.node.tryGetContext('keyName'),
    // })

    // RDS Subnet Group
    this.subnetGroup = new rds.SubnetGroup(this, 'rds-subnet-group', {
      vpc: this.vpc,
      subnetGroupName: 'aurora-subnet-group',
      vpcSubnets: { subnetType: ec2.SubnetType.ISOLATED },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      description: 'An all private subnets group for the DB',
    })

    new ec2.InterfaceVpcEndpoint(this, 'secrets-manager', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      vpc: this.vpc,
      privateDnsEnabled: true,
      subnets: { subnetType: ec2.SubnetType.ISOLATED },
      securityGroups: [this.privateSg],
    })
  }
}
