#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InfrastructureStack } from "./infrastructure-stack";

const env = process.env.ENV ?? "dev";
const stackName = env === "dev" ? `TodosStack-${env}` : `TodosStack`;

const app = new cdk.App();
new InfrastructureStack(app, stackName, {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-2'
  },
});
