import * as cdk from "aws-cdk-lib";
import { ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path from "path";
import { config } from "dotenv";

const env = process.env.ENV ?? "dev";
config({
  path: path.resolve(__dirname, `../../.env${env === "dev" ? "" : `.${env}`}`),
});

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

    const certificate =
      cdk.aws_certificatemanager.Certificate.fromCertificateArn(
        this,
        "TodosCertificate",
        getEnvVarOrThrow("CERTIFICATE_ARN")
      );

    const responseHeaderPolicy = new cdk.aws_cloudfront.ResponseHeadersPolicy(
      this,
      "SecurityHeadersResponseHeaderPolicy",
      {
        comment: "Security headers response header policy",
        corsBehavior: {
          accessControlAllowOrigins: ["*"],
          accessControlAllowMethods: ["GET", "PUT", "POST", "DELETE"],
          accessControlAllowHeaders: ["*"],
          accessControlAllowCredentials: false,
          originOverride: true,
        },
        securityHeadersBehavior: {
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
        domainNames: [`todos.${getEnvVarOrThrow("DOMAIN_NAME")}`],
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

    if (env === "prod") {
      const zone = cdk.aws_route53.HostedZone.fromLookup(this, "TodosZone", {
        domainName: getEnvVarOrThrow("DOMAIN_NAME"),
      });

      new cdk.aws_route53.ARecord(this, "ARecord", {
        recordName: "todos",
        target: cdk.aws_route53.RecordTarget.fromAlias(
          new cdk.aws_route53_targets.CloudFrontTarget(cloudfrontDistribution)
        ),
        zone,
      });
    }

    const table = new cdk.aws_dynamodb.Table(this, `TodosTable-${env}`, {
      partitionKey: { name: "id", type: cdk.aws_dynamodb.AttributeType.STRING },
      tableName: `TodosTable-${env}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const lambda = new NodejsFunction(this, `TodosFunction-${env}`, {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, "./lambda/todosHandler.ts"),
      bundling: {
        esbuildArgs: {
          "--packages": "bundle",
        },
      },
      environment: {
        TODOS_TABLE: table.tableName,
        ENV: env,
        AUTH0_DOMAIN: getEnvVarOrThrow("REACT_APP_AUTH0_DOMAIN"),
        AUTH: process.env.REACT_APP_AUTH ?? "true",
      },
      timeout: cdk.Duration.seconds(7),
    });

    const api = new cdk.aws_apigateway.LambdaRestApi(this, `TodosApi-${env}`, {
      handler: lambda,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
      },
    });

    table.grantReadWriteData(lambda);

    const todosResource = api.root.addResource("todos");
    todosResource.addMethod("PUT");
    todosResource.addMethod("GET");
  }
}

const getEnvVarOrThrow = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} has no value set in .env.${env}`);

  return value;
};
