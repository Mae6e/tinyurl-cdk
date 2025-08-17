import * as cdk from 'aws-cdk-lib';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export interface CacheStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  securityGroup: ec2.ISecurityGroup;
}

interface CacheConfig {
  host: string;
  port: string;
}

export class CacheStack extends Construct {
  public readonly config: CacheConfig;

  constructor(scope: Construct, id: string, props: CacheStackProps) {
    super(scope, id);

    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'SubnetGroup', {
      description: 'Subnet group for Redis',
      subnetIds: props.vpc.privateSubnets.map((s) => s.subnetId),
    });

    const redis = new elasticache.CfnCacheCluster(this, 'RedisCache', {
      engine: 'redis',
      cacheNodeType: 'cache.t2.micro',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [props.securityGroup.securityGroupId],
      cacheSubnetGroupName: subnetGroup.ref,
    });

    this.config = {
      host: redis.attrRedisEndpointAddress,
      port: redis.attrRedisEndpointPort,
    };
  }
}
