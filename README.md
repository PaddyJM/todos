# React Todo App.

A complete todo application with all features and IaC (Infrastructure as Code) for deployment into serverless architecture hosted in AWS, using Auth0 as the provider for OAuth 2.0 authorization.

---

## Project Description

This is a complete application with:

- Front end (React, S3)
- Back end (API Gateway, Lambda)
- Database (DynamoDB)
- User authentication (Auth0)
- Content Delivery Network (Cloudfront)
- Custom DNS (Route 53, AWS Certificate Manager)

Click the following link to see a production deployment of it:

[todos.patrickmorton.co.uk](https://todos.patrickmorton.co.uk)

## Architecture

Here is a diagram of the project architecture:

![](./architecture.png)

## Local development

The front-end of the application (the static website created using React) can be built and run using the command:

```
npm run dev
```

NOTE: by default this will run on localhost port 3000; this can be changed by setting the `LOCAL_DEV_PORT` envrionment variable in the `.env` file.

The back-end of the application (the API consisting of API Gateway, Lambda and DynamoDB) can deployed locally. This relies on the user having the AWS SAM CLI installed (SAM is a different framework to CDK, however it can still use CDK generated cloudformation templates to build local APIs). 

To install the AWS SAM CLI follow the instructions ![here](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).

NOTE: the port to run the API on also needs to be set locally in the `LOCAL_API_PORT` variable in the `.env` file. 

The back end API can then be spun up by running the following command:

```
npm run deploy:api:dev
```

TODO: find a solution to bypass auth 
