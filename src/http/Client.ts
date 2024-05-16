import axios, { AxiosError } from "axios";
import { Todo } from "../types";
import toast from "react-hot-toast";

export default class Client {
  private URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  constructor() {}

  public async putTodoList(userId: string, todoList: Todo[]): Promise<any> {
    try {
      return await axios.put(
        `${this.URL}/todos`,
        {
          todoList,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "Error updating todo list; changes have not been saved and may be lost when you leave this browser tab"
      );
    }
  }

  public async getTodoList(userId: string): Promise<any> {
    try {
      return await axios.get(`${this.URL}/todos`, {headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }});
    } catch (error) {
      console.error(error);
      if ((error as AxiosError).response?.status === 404) {
        console.log("No todo list found");
        return { data: { todoList: null } };
      }
      throw new Error("Error retrieving todo list");
    }
  }
}
