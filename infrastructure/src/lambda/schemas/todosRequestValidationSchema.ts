import { z } from "zod";

export default z.object({
  todoList: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
      time: z.string(),
    })
  ),
});