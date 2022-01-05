import {
  CfnOutput,
  Construct,
  Duration,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { Code, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import {
  NodejsFunction,
  NodejsFunctionProps,
  SourceMapMode,
} from '@aws-cdk/aws-lambda-nodejs';

import { join } from 'path';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Frontend
    const websiteBucket = new Bucket(this, 'NxStackFronted', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    new BucketDeployment(this, 'NxStackFrontendDeployment', {
      sources: [
        Source.asset(join(__dirname, '../../../../dist/apps/frontend')),
      ],
      destinationBucket: websiteBucket,
    });

    new CfnOutput(this, 'URL', {
      description: 'The url of the website',
      value: websiteBucket.bucketWebsiteUrl,
    });

    // Backend
    const lambda = new NodejsFunction(this, 'Lambda', {
      entry: join(__dirname, '../../../../dist/apps/api/main.js'),
      // bundling: {
      //   minify: true,
      //   sourceMap: true,
      //   sourceMapMode: SourceMapMode.BOTH,
      //   preCompilation: true,
      //   // nodeModules: [
      //   //   'class-transformer',
      //   //   'cache-manager',
      //   //   'class-validator',
      //   //   '@nestjs/microservices',
      //   //   '@nestjs/microservices/microservices-module',
      //   //   '@nestjs/websockets/socket-module',
      //   // ]
      // },
      environment: {},
      handler: 'handler',
      memorySize: 1024,
      timeout: Duration.seconds(5),
      runtime: Runtime.NODEJS_14_X,
    });

    const httpApi = new HttpApi(this, 'HttpApi', {
      description: 'HTTP API Gateway',
      defaultAuthorizationScopes: [],
    });

    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.PUT,
        HttpMethod.DELETE,
      ],
      integration: new HttpLambdaIntegration('LambdaIntegration', lambda),
    });
  }
}
