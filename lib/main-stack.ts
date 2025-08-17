import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DatabaseStack } from './database-stack';
import { CacheStack } from './cache-stack';
import { ApiStack } from './api-stack';
import { LambdaStack } from './lambda-stack';
//import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });

    // Security Group
    const lambdaSg = new ec2.SecurityGroup(this, 'LambdaSG', { vpc });

    // Database
    const dbStack = new DatabaseStack(this, 'Database', {
      vpc,
      securityGroup: lambdaSg,
    });

    // Cache
    const cacheStack = new CacheStack(this, 'Cache', {
      vpc,
      securityGroup: lambdaSg,
    });

    //Lambda
    const lambdaStack = new LambdaStack(this, 'Lambda', {
      vpc,
      securityGroup: lambdaSg,
    });

    // Add Enviroment to lambda
    lambdaStack.handler.addEnvironment('DB_HOST', dbStack.config.host);
    lambdaStack.handler.addEnvironment('DB_PORT', dbStack.config.port);
    lambdaStack.handler.addEnvironment('DB_USER', dbStack.config.username);
    lambdaStack.handler.addEnvironment('DB_PASSWORD', dbStack.config.password);
    lambdaStack.handler.addEnvironment('DB_NAME', dbStack.config.database);
    lambdaStack.handler.addEnvironment('REDIS_HOST', cacheStack.config.host);
    lambdaStack.handler.addEnvironment('REDIS_PORT', cacheStack.config.port);

    // API
    new ApiStack(this, 'Api', {
      handler: lambdaStack.handler,
    });
  }
}
