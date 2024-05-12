import * as cdk from "aws-cdk-lib";
import { ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const env = process.env.ENV || "dev";

const DOMAIN_NAME = "todos.patrickmorton.co.uk";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, "TodosBucket", {
      publicReadAccess: false,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      accessControl: cdk.aws_s3.BucketAccessControl.PRIVATE,
      objectOwnership: cdk.aws_s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
    });

    const cloudfrontOriginAccessIdentity =
      new cdk.aws_cloudfront.OriginAccessIdentity(
        this,
        "CloudFrontOriginAccessIdentity"
      );

    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [
          new cdk.aws_iam.CanonicalUserPrincipal(
            cloudfrontOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const zone = cdk.aws_route53.HostedZone.fromLookup(this, "TodosZone", {
      domainName: 'patrickmorton.co.uk',
    });

    const certificate =
      cdk.aws_certificatemanager.Certificate.fromCertificateArn(
        this,
        "TodosCertificate",
        "arn:aws:acm:us-east-1:011624951925:certificate/1d82e3c4-f584-4173-ac53-23fd29656420"
      );

    const responseHeaderPolicy = new cdk.aws_cloudfront.ResponseHeadersPolicy(
      this,
      "SecurityHeadersResponseHeaderPolicy",
      {
        comment: "Security headers response header policy",
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            override: true,
            contentSecurityPolicy: "default-src 'self'",
          },
          strictTransportSecurity: {
            override: true,
            accessControlMaxAge: cdk.Duration.days(2 * 365),
            includeSubdomains: true,
            preload: true,
          },
          contentTypeOptions: {
            override: true,
          },
          referrerPolicy: {
            override: true,
            referrerPolicy:
              cdk.aws_cloudfront.HeadersReferrerPolicy
                .STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          },
          xssProtection: {
            override: true,
            protection: true,
            modeBlock: true,
          },
          frameOptions: {
            override: true,
            frameOption: cdk.aws_cloudfront.HeadersFrameOption.DENY,
          },
        },
      }
    );

    new cdk.aws_s3_deployment.BucketDeployment(this, "TodosWebsite", {
      sources: [cdk.aws_s3_deployment.Source.asset("../build")],
      destinationBucket: bucket,
    });

    const cloudfrontDistribution = new cdk.aws_cloudfront.Distribution(
      this,
      "CloudFrontDistribution",
      {
        certificate: certificate,
        domainNames: [DOMAIN_NAME],
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.S3Origin(bucket, {
            originAccessIdentity: cloudfrontOriginAccessIdentity,
          }),
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          responseHeadersPolicy: responseHeaderPolicy,
        },
      }
    );

    new cdk.aws_route53.ARecord(this, "ARecord", {
      recordName: 'todos',
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.CloudFrontTarget(cloudfrontDistribution)
      ),
      zone,
    });

    /**
     * Comment this out if creating a new table
     */
    // const table = cdk.aws_dynamodb.Table.fromTableArn(
    //   this,
    //   `TodosTable-${env}`,
    //   `arn:aws:dynamodb:eu-west-2:011624951925:table/TodoTable-${env}`
    // );

    /**
     * Uncomment this to create new table if necessary
     */
    const table = new cdk.aws_dynamodb.Table(this, `TodosTable-${env}`, {
      partitionKey: { name: "id", type: cdk.aws_dynamodb.AttributeType.STRING },
      tableName: `TodosTable-${env}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const lambda = new NodejsFunction(this, `TodosFunction-${env}`, {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "./lambda/saveTodosHandler.ts"),
      environment: {
        TODOS_TABLE: table.tableName,
      },
    });

    const api = new cdk.aws_apigateway.LambdaRestApi(this, `TodosApi-${env}`, {
      handler: lambda,
      proxy: false,
    });

    table.grantReadWriteData(lambda);

    api.root.addResource("todos").addMethod("PUT");
  }
}