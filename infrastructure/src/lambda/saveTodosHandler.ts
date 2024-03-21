import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dynamoose from "dynamoose";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const env = process.env.ENV || "dev";

  if (env === "dev") {
    const ddb = new dynamoose.aws.ddb.DynamoDB({
      region: "localhost",
      endpoint: "http://dynamodb-local:8000",
    });

    dynamoose.aws.ddb.set(ddb);
  }

  let result;
  try {
    const schema = new dynamoose.Schema(
      {
        id: String,
        todos: Array,
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

    const Todos = dynamoose.model("Todos", schema, {
      tableName: `TodosTable-${env}`,
    });

    const todos = new Todos({
      id: "user1",
      todos: [{ id: "1", text: "Do something" }],
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
