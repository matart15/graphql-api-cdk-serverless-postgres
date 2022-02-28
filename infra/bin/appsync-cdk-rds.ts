#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { ApiStack } from '../lib/ApiStack'
import { NetworkStack } from '../lib/NetworkStack'
import { DataStack } from '../lib/DataStack'
import { AuthStack } from '../lib/AuthStack'

const app = new cdk.App()
const env = {
  region: app.node.tryGetContext('region'),
  account: app.node.tryGetContext('accountID'),
}
const networkStack = new NetworkStack(app, 'NetworkStack', {
  env,
})
const authStack = new AuthStack(app, 'AuthStack', {
  env,
})
const dataStack = new DataStack(app, 'DataStack', {
  env,
  vpc: networkStack.vpc,
  privateSg: networkStack.privateSg,
  subnetGroup: networkStack.subnetGroup,
})
new ApiStack(app, 'ApiStack', {
  env,
  vpc: networkStack.vpc,
  privateSg: networkStack.privateSg,
  dbCluster: dataStack.dbCluster,
  userPool: authStack.userPool,
})
