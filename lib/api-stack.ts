import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export interface ApiStackProps extends cdk.StackProps {
  handler: cdk.aws_lambda.Function;
}

export class ApiStack extends Construct {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    // API Gateway
    const api = new apigateway.RestApi(this, 'TinyUrlApi', {
      deployOptions: {
        throttlingRateLimit: 10,
        throttlingBurstLimit: 5,
      },
    });

    // POST /shorten
    api.root
      .addResource('shorten')
      .addMethod('POST', new apigateway.LambdaIntegration(props.handler));

    // GET /{code}
    api.root
      .addResource('{code}')
      .addMethod('GET', new apigateway.LambdaIntegration(props.handler));

    // Create output within the stack
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}
