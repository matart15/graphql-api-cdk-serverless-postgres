import * as cdk from '@aws-cdk/core';
// import * as sqs from '@aws-cdk/aws-sqs';

export class CdkAppsyncPrismaBoilerplateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    console.log('useful const');

    // example resource
    // const queue = new sqs.Queue(this, 'CdkAppsyncPrismaBoilerplateQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
