import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dynamoose from "dynamoose";
import { z } from "zod";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const env = process.env.ENV || "dev";

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
    if (event.httpMethod === "PUT") {
      const validationSchema = z.object({
        id: z.string(),
        todoList: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            status: z.string(),
            time: z.string(),
          })
        ),
      });

      const parsedBody = validationSchema.parse(JSON.parse(event.body ?? "{}"));

      const todos = new Todos({
        id: parsedBody.id,
        todoList: parsedBody.todoList,
      });

      result = await todos.save();
    } else if (event.httpMethod === "GET") {
      let userId;
      try {
        userId = event.pathParameters?.userId;
        if (!userId) {
          throw new Error("userId is required");
        }
      } catch (error) {
        console.error(error);
        return {
          statusCode: 400,
          body: JSON.stringify(error),
        };
      }
      result = await Todos.get(userId);
      if(result === undefined) {
        result = { id: userId, todoList: [] };
      } else if (!result.todoList) {
        throw new Error("Error retrieving todo list");
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
