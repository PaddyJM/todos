import axios from "axios";
import { Todo } from "../types";
import toast from "react-hot-toast";

export default class Client {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  public async putTodoList(userId: string, todoList: Todo[]): Promise<any> {
    try {
      return await axios.put(this.url, {
        id: userId,
        todoList,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error updating todo list; changes have not been saved and may be lost when you leave this browser tab");
    }
  }

  public async getTodoList(userId: string): Promise<any> {
    try {
      return await axios.get(`${this.url}/${userId}`);
    } catch (error) {
      console.error(error);
      toast.error("Error retrieving todo list");
      return { data: { todoList: [] } };
    }
  }
}
