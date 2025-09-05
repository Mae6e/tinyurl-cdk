import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DatabaseStack } from './database-stack';
import { CacheStack } from './cache-stack';
import { ApiStack } from './api-stack';
import { LambdaStack } from './lambda-stack';

import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });

    // Security Group
    const lambdaSg = new ec2.SecurityGroup(this, 'LambdaSG', {
      vpc,
      allowAllOutbound: true,
    });

    //!  `0.0.0.0/0` allIp or yourIp
    const ip = process.env.ACCESS_IP;

    // Add ingress rules for your IP - PostgreSQL
    lambdaSg.addIngressRule(
      ec2.Peer.ipv4(ip),
      ec2.Port.tcp(parseInt(process.env.DB_PORT as string)),
      'Allow PostgreSQL access from my IP',
    );

    // Custom TCP - change port as needed
    lambdaSg.addIngressRule(
      ec2.Peer.ipv4(ip),
      ec2.Port.tcp(parseInt(process.env.REDIS_PORT as string)),
      'Allow custom TCP access from my IP',
    );

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
