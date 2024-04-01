import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as dynamoose from "dynamoose";

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
              id: String,
              title: String,
              status: Boolean,
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
      create: false,
    });

    const todos = new Todos({
      id: "user1",
      todos: [{ id: "1", title: "Do something", status: false }],
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
