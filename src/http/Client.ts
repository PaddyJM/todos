import axios from "axios";
import { Todo } from "../types";

export default class Client {
  private url: string;
  constructor(url: string) {
    this.url = url;
  }

  public async putTodoList(userId: string, todoList: Todo[]): Promise<any> {
    return await axios.put(this.url, {
      id: userId,
      todoList,
    });
  }

  public async getTodoList(userId: string): Promise<any> {
    return await axios.get(`${this.url}/${userId}`);
  }
}
