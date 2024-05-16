import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dynamoose from "dynamoose";
import { z } from "zod";
import { createRemoteJWKSet, jwtVerify } from "jose";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const env = process.env.ENV || "dev";

  const jwt = event.headers?.Authorization?.split(" ")[1];

  if (!jwt) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  const JWKS = createRemoteJWKSet(
    new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
  );

  let tokenPayload;
  try {
    const { payload } = await jwtVerify(jwt, JWKS, {
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    });

    tokenPayload = payload;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" }),
    };
  }

  let ddb;
  if (env === "dev") {
    ddb = new dynamoose.aws.ddb.DynamoDB({
      region: "localhost",
      endpoint: "http://dynamodb-local:8000",
    });
  } else {
    ddb = new dynamoose.aws.ddb.DynamoDB();
  }

  dynamoose.aws.ddb.set(ddb);

  const schema = new dynamoose.Schema(
    {
      id: String,
      todoList: {
        type: Array,
        schema: [
          {
            type: Object,
            schema: {
              id: String,
              title: String,
              status: String,
              time: String,
            },
          },
        ],
      },
      updated_at: String,
    },
    {
      timestamps: {
        createdAt: {
          created_at: {
            type: {
              value: Date,
              settings: {
                storage: "iso",
              },
            },
          },
        },
        updatedAt: {
          updated: {
            type: {
              value: Date,
              settings: {
                storage: "iso",
              },
            },
          },
        },
      },
    }
  );

  let result;
  try {
    const Todos = dynamoose.model("Todos", schema, {
      tableName: `TodosTable-${env}`,
      create: env === "test" ? true : false,
    });

    const userId = tokenPayload.sub;
    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    if (event.httpMethod === "PUT") {
      const validationSchema = z.object({
        todoList: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            status: z.string(),
            time: z.string(),
          })
        ),
      });

      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "No request body found" }),
        };
      }

      const parsedBody = validationSchema.parse(JSON.parse(event.body));

      const todos = new Todos({
        id: userId,
        todoList: parsedBody.todoList,
      });

      result = await todos.save();
    } else if (event.httpMethod === "GET") {
      result = await Todos.get(userId);

      if (result === undefined) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "No todo list found" }),
        };
      }
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(result),
  };
};
