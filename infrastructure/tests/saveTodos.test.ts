import { handler } from "../src/lambda/todosHandler";
import { createApiGatewayEvent } from "./utils/aws";

it("calls the handler", async () => {
  const event = createApiGatewayEvent({
    body: JSON.stringify({
      id: "user1",
      todos: [{ id: 1, title: "Do something", status: false }],
    }),
  });

  const result = await handler(event);
  expect(result.statusCode).toEqual(200);
  expect(JSON.parse(result.body)).toEqual({
    id: "user1",
    todos: [{ id: 1, title: "Do something", status: false }],
    created_at: expect.any(String),
    updated: expect.any(String),
  });
});
