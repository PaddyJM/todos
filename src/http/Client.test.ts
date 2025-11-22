import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import { Todo } from "../types";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("js-cookie");
jest.mock("jose");

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockToast = toast as jest.Mocked<typeof toast>;
const mockCookies = Cookies as jest.Mocked<typeof Cookies>;
const mockDecodeJwt = decodeJwt as jest.MockedFunction<typeof decodeJwt>;

describe("Client", () => {
  let client: any;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      put: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
        },
      },
    };

    mockAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
    mockToast.error = jest.fn();
    mockCookies.get = jest.fn();
    mockCookies.set = jest.fn();
    mockDecodeJwt.mockReturnValue({
      exp: Math.floor(Date.now() / 1000) + 3600,
    } as any);

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});

    jest.isolateModules(() => {
      const ClientModule = require("./Client");
      client = ClientModule.default;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockRestore();
    (console.log as jest.Mock).mockRestore();
  });

  const createMockTodo = (overrides?: Partial<Todo>): Todo => ({
    id: "1",
    title: "Test Todo",
    status: "incomplete",
    time: "2023-01-01T00:00:00.000Z",
    comments: [],
    ...overrides,
  });

  describe("putTodoList", () => {
    it("should successfully save todo list", async () => {
      const mockTodos = [createMockTodo()];
      const mockResponse = { data: { todoList: mockTodos } };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      const result = await client.putTodoList(mockTodos);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        expect.stringContaining("/todos"),
        { todoList: mockTodos }
      );
      expect(result).toEqual(mockResponse);
      expect(mockToast.error).not.toHaveBeenCalled();
    });

    it("should return null and show error toast on failure", async () => {
      const mockTodos = [createMockTodo()];
      const error = new Error("Network error");
      mockAxiosInstance.put.mockRejectedValueOnce(error);

      const result = await client.putTodoList(mockTodos);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        "Error syncing todo list:",
        error
      );
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining("Error updating todo list")
      );
    });
  });

  describe("getTodoList", () => {
    it("should successfully fetch todo list", async () => {
      const mockTodos = [createMockTodo()];
      const mockResponse = { data: { todoList: mockTodos } };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      const result = await client.getTodoList();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        expect.stringContaining("/todos")
      );
      expect(result).toEqual(mockResponse);
    });

    it("should return empty array on 404 error", async () => {
      const error = {
        response: { status: 404 },
      } as AxiosError;
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      const result = await client.getTodoList();

      expect(result).toEqual({ data: { todoList: [] } });
      expect(console.log).toHaveBeenCalledWith("No todo list found");
    });

    it("should throw error on non-404 errors", async () => {
      const error = {
        response: { status: 500 },
      } as AxiosError;
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(client.getTodoList()).rejects.toThrow(
        "Error retrieving todo list"
      );
      expect(console.error).toHaveBeenCalled();
    });

    it("should throw error when no response status", async () => {
      const error = new Error("Network error");
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(client.getTodoList()).rejects.toThrow(
        "Error retrieving todo list"
      );
    });
  });

  describe("setTokenGenerator", () => {
    it("should set token generator and return client instance", () => {
      const mockTokenGenerator = jest.fn().mockResolvedValue("mock-token");

      const result = client.setTokenGenerator(mockTokenGenerator);

      expect(client.tokenGenerator).toBe(mockTokenGenerator);
      expect(result).toBe(client);
    });
  });

  describe("getToken", () => {
    it("should call tokenGenerator", async () => {
      const mockToken = "mock-token";
      const mockTokenGenerator = jest.fn().mockResolvedValue(mockToken);
      client.setTokenGenerator(mockTokenGenerator);

      const result = await client.getToken();

      expect(mockTokenGenerator).toHaveBeenCalled();
      expect(result).toBe(mockToken);
    });
  });
});
