#!/usr/bin/env node
import 'source-map-support/register';
import 'module-alias/register';
import * as cdk from '@aws-cdk/core';
import {
  clearDeployment,
  createStack,
  prepareStack,
} from '@lib/cdk_appsync_prisma_boilerplate-stack';

const main = async () => {
  const app = new cdk.App();

            await prepareStack();
            await createStack(app);
            await clearDeployment();

  // new CdkAppsyncPrismaBoilerplateStack(
  //   app,
  //   'CdkAppsyncPrismaBoilerplateStack',
  //   {
  //     /* If you don't specify 'env', this stack will be environment-agnostic.
  //      * Account/Region-dependent features and context lookups will not work,
  //      * but a single synthesized template can be deployed anywhere. */

  //     /* Uncomment the next line to specialize this stack for the AWS Account
  //      * and Region that are implied by the current CLI configuration. */
  //     // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  //     /* Uncomment the next line if you know exactly what Account and Region you
  //      * want to deploy the stack to. */
  //     env: { account: '945731703827', region: 'ap-northeast-1' },

  //     /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  //   },
  // );
  return app;
};
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
