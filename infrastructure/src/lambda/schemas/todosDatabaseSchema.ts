import * as dynamoose from "dynamoose";

export default new dynamoose.Schema(
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