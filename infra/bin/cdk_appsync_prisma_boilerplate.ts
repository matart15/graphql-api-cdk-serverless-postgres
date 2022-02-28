#!/usr/bin/env node
import 'source-map-support/register';
import 'module-alias/register';
import * as cdk from '@aws-cdk/core';
import {
  clearDeployment,
  createStack,
  prepareStack,
} from '@lib/cdk_appsync_prisma_boilerplate-stack';
import { BuildConfig } from '@lib/helpers/buildConfig';

function ensureString(
  object: { [name: string]: any },
  propName: string,
): string {
  if (!object[propName] || object[propName].trim().length === 0)
    throw new Error(propName + ' does not exist or is empty');

  return object[propName];
}

function getConfig(app: cdk.App): BuildConfig {
  const env = app.node.tryGetContext('config');
  if (!env)
    throw new Error(
      'Context variable missing on CDK command. Pass in as `-c config=XXX`',
    );

  const unparsedEnv = app.node.tryGetContext(env);

  const buildConfig: BuildConfig = {
    AWSAccountID: ensureString(unparsedEnv, 'AWSAccountID'),
    AWSProfileName: ensureString(unparsedEnv, 'AWSProfileName'),
    AWSProfileRegion: ensureString(unparsedEnv, 'AWSProfileRegion'),

    App: ensureString(unparsedEnv, 'App'),
    Version: ensureString(unparsedEnv, 'Version'),
    Environment: ensureString(unparsedEnv, 'Environment'),
    Build: ensureString(unparsedEnv, 'Build'),

    Parameters: {
      LambdaInsightsLayer: ensureString(
        unparsedEnv['Parameters'],
        'LambdaInsightsLayer',
      ),
      SomeExternalApiUrl: ensureString(
        unparsedEnv['Parameters'],
        'SomeExternalApiUrl',
      ),
    },
  };

  return buildConfig;
}

const main = async () => {
  const app = new cdk.App();

  const buildConfig = getConfig(app);

  cdk.Tags.of(app).add('App', buildConfig.App);
  cdk.Tags.of(app).add('Environment', buildConfig.Environment);

  const mainStackName =
    buildConfig.App + '-' + buildConfig.Environment + '-main';

  await prepareStack();
  await createStack({ app, mainStackName });
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
