import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.ISecurityGroup;
}

export class LambdaStack extends Construct {
  public handler: cdk.aws_lambda.Function;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    // Lambda function
    this.handler = new lambda.Function(this, 'UrlHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset('src'),
      handler: 'main.handler',
      vpc: props.vpc,
      securityGroups: [props.securityGroup],
      //memorySize: 128,
      timeout: cdk.Duration.seconds(3),
    });
  }
}
