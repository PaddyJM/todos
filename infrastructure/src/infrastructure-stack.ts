import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import path = require("path");
// import * as sqs from 'aws-cdk-lib/aws-sqs';

const env = process.env.ENV || "dev";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, "TodosBucket", {
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: cdk.aws_s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      bucketName: "todos.patrickmorton.co.uk",
    });

    new cdk.aws_s3_deployment.BucketDeployment(this, "TodosWebsite", {
      sources: [cdk.aws_s3_deployment.Source.asset("../build")],
      destinationBucket: bucket,
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

    const dynamoDbEndpoint = env === "dev" ? "http://localhost:8000" : '';

    const lambda = new NodejsFunction(this, `TodosFunction-${env}`, {
      runtime: cdk.aws_lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, './lambda/saveTodosHandler.ts'),
      environment: {
        TODOS_TABLE: table.tableName,
        DYNAMO_DB_ENDPOINT: dynamoDbEndpoint,
      },
    });

    const api = new cdk.aws_apigateway.LambdaRestApi(this, `TodosApi-${env}`, {
      handler: lambda,
      proxy: false,
    });

    table.grantReadWriteData(lambda);

    api.root.addResource("todos").addMethod("GET");
  }
}
