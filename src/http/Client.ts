import axios, { AxiosError } from "axios";
import { Todo } from "../types";
import toast from "react-hot-toast";
import { decodeJwt } from "jose";

class Client {
  private static instance: any;
  private URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
  // this function needs to be set inside react component so cannot be set here as this client
  // is used only in non-react components, hence the definite assignment assertion
  tokenGenerator!: () => Promise<string>;

  constructor() {
    Client.instance = axios.create({ baseURL: this.URL });

    Client.instance.interceptors.request.use(
      async (config: { headers: any }) => {
        const token = await this.getToken();

        return {
          ...config,
          headers: { ...config.headers, Authorization: `Bearer ${token}` },
        };
      },
      (error: any) => {
        Promise.reject(error);
      }
    );

    return this;
  }

  setTokenGenerator(tokenGenerator: any): this {
    this.tokenGenerator = tokenGenerator;
    return this;
  }

  getToken() {
    return this.tokenGenerator();
  }

  public async putTodoList(todoList: Todo[]): Promise<any> {
    try {
      return await Client.instance.put(
        `${this.URL}/todos`,
        {
          todoList,
        }
      );
    } catch (error) {
      console.error(error);
      toast.error(
        "Error updating todo list; changes have not been saved and may be lost when you leave this browser tab"
      );
    }
  }

  public async getTodoList(): Promise<any> {
    try {
      return await Client.instance.get(`${this.URL}/todos`);
    } catch (error) {
      console.error(error);
      if ((error as AxiosError).response?.status === 404) {
        console.log("No todo list found");
        return { data: { todoList: [] } };
      }
      throw new Error("Error retrieving todo list");
    }
  }
}

export default new Client();
