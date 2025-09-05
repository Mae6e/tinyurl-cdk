import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.ISecurityGroup;
}

export interface DbConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

export class DatabaseStack extends Construct {
  public readonly cluster: rds.ServerlessCluster;
  public readonly credentials: secretsmanager.ISecret;
  public readonly config: DbConfig;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id);

    this.credentials = new secretsmanager.Secret(this, 'DbCredentials', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: process.env.DB_USER }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\',
      },
    });

    const database = new rds.DatabaseInstance(
      this,
      process.env.DB_NAME as string,
      {
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_16_9,
        }),
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.BURSTABLE3,
          ec2.InstanceSize.MICRO,
        ),
        allocatedStorage: 10,
        maxAllocatedStorage: 10,
        vpc: props.vpc,
        credentials: rds.Credentials.fromSecret(this.credentials),
        databaseName: process.env.DB_NAME,
        securityGroups: [props.securityGroup],
      },
    );

    const password = this.credentials
      .secretValueFromJson('password')
      .unsafeUnwrap();

    this.config = {
      host: database.dbInstanceEndpointAddress,
      port: database.dbInstanceEndpointPort,
      username: process.env.DB_USER as string,
      password,
      database: process.env.DB_NAME as string,
    };
  }
}
