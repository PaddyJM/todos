import {
  APIGatewayProxyEvent,
} from "aws-lambda";

export const createApiGatewayEvent = (
  overrides: Partial<APIGatewayProxyEvent> = {}
): APIGatewayProxyEvent => {
  return {
    body: "",
    headers: {},
    httpMethod: "",
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path: "",
    pathParameters: null,
    queryStringParameters: {},
    requestContext: {
      path: "",
      protocol: "",
      httpMethod: "",
      identity: {
        accessKey: "",
        accountId: "",
        apiKey: "",
        apiKeyId: "",
        caller: "",
        cognitoAuthenticationProvider: "",
        cognitoAuthenticationType: "",
        cognitoIdentityId: "",
        cognitoIdentityPoolId: "",
        principalOrgId: "",
        sourceIp: "",
        user: "",
        userAgent: "",
        userArn: "",
        clientCert: {
          clientCertPem: "",
          subjectDN: "",
          issuerDN: "",
          serialNumber: "",
          validity: {
            notBefore: "",
            notAfter: "",
          },
        },
      },
      accountId: "",
      apiId: "",
      authorizer: {
        jwt: {
          claims: {},
          scopes: [],
        },
      },
      requestTimeEpoch: 0,
      requestId: "",
      resourceId: "",
      resourcePath: "",
      domainName: "",
      domainPrefix: "",
      routeKey: "",
      stage: "",
    },
    resource: "",
    stageVariables: {},
    ...overrides,
  };
};
