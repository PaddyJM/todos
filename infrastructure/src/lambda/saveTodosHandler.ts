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
  } else if (env === "test") {
    ddb = new dynamoose.aws.ddb.DynamoDB({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  } else {
    ddb = new dynamoose.aws.ddb.DynamoDB();
  }

  dynamoose.aws.ddb.set(ddb);

  const schema = new dynamoose.Schema(
    {
      id: String,
      todos: {
        type: Array,
        schema: [
          {
            type: Object,
            schema: {
              id: Number,
              title: String,
              status: Boolean,
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

  const validationSchema = z.object({
    id: z.string(),
    todos: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        status: z.boolean(),
        time: z.string(),
      })
    ),
  });

  const parsedBody = validationSchema.parse(JSON.parse(event.body ?? "{}"));

  let result;
  try {
    const Todos = dynamoose.model("Todos", schema, {
      tableName: `TodosTable-${env}`,
      create: env === "test" ? true : false,
    });

    const todos = new Todos({
      id: parsedBody.id,
      todos: parsedBody.todos,
    });

    result = await todos.save();
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
