import axios from "axios";
import { Todo } from "../types";
import toast from "react-hot-toast";

export default class Client {
  private URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  constructor() {}

  public async putTodoList(userId: string, todoList: Todo[]): Promise<any> {
    try {
      return await axios.put(`${this.URL}/todos`, {
        id: userId,
        todoList,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        "Error updating todo list; changes have not been saved and may be lost when you leave this browser tab"
      );
    }
  }

  public async getTodoList(userId: string): Promise<any> {
    try {
      return await axios.get(`${this.URL}/todos/${encodeURI(userId)}`);
    } catch (error) {
      console.error(error);
      throw new Error("Error retrieving todo list");
    }
  }
}
