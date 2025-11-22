import useTodosStore from "./todosStore";
import useUserStore from "./userStore";
import client from "../http/Client";
import toast from "react-hot-toast";
import { Todo, TodoComment } from "../types";

jest.mock("./userStore");
jest.mock("../http/Client");
jest.mock("react-hot-toast");
jest.mock("zukeeper", () => (fn: any) => fn);

const mockClient = client as jest.Mocked<typeof client>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe("todosStore", () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};

    global.Storage.prototype.getItem = jest.fn((key: string) => {
      return localStorageMock[key] || null;
    });

    global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });

    (useUserStore.getState as jest.Mock) = jest.fn().mockReturnValue({
      user: { sub: "user123" },
    });

    mockClient.putTodoList = jest.fn().mockResolvedValue({ data: {} });
    mockClient.getTodoList = jest
      .fn()
      .mockResolvedValue({ data: { todoList: [] } });
    mockToast.success = jest.fn();
    mockToast.error = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});

    useTodosStore.setState({
      todoList: null,
      filterStatus: "all",
      isInitialLoadComplete: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockRestore();
  });

  const createMockTodo = (overrides?: Partial<Todo>): Todo => ({
    id: "1",
    title: "Test Todo",
    status: "incomplete",
    time: "2023-01-01T00:00:00.000Z",
    comments: [],
    ...overrides,
  });

  const createMockComment = (
    overrides?: Partial<TodoComment>
  ): TodoComment => ({
    comment: "Test comment",
    time: "2023-01-01T00:00:00.000Z",
    ...overrides,
  });

  describe("setFilterStatus", () => {
    it("should update filter status", () => {
      useTodosStore.getState().setFilterStatus("completed");
      expect(useTodosStore.getState().filterStatus).toBe("completed");
    });
  });

  describe("getInitialTodoList", () => {
    it("should set todoList to null when no todos returned", async () => {
      mockClient.getTodoList.mockResolvedValueOnce({
        data: { todoList: null },
      });

      await useTodosStore.getState().getInitialTodoList();

      expect(useTodosStore.getState().todoList).toBeNull();
      expect(useTodosStore.getState().isInitialLoadComplete).toBe(true);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("should set todoList and localStorage when todos are returned", async () => {
      const mockTodos = [createMockTodo()];
      mockClient.getTodoList.mockResolvedValueOnce({
        data: { todoList: mockTodos },
      });

      await useTodosStore.getState().getInitialTodoList();

      expect(useTodosStore.getState().todoList).toEqual(mockTodos);
      expect(useTodosStore.getState().isInitialLoadComplete).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoList",
        JSON.stringify(mockTodos)
      );
    });

    it("should set empty array when empty todos list is returned", async () => {
      mockClient.getTodoList.mockResolvedValueOnce({ data: { todoList: [] } });

      await useTodosStore.getState().getInitialTodoList();

      expect(useTodosStore.getState().todoList).toEqual([]);
      expect(useTodosStore.getState().isInitialLoadComplete).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoList",
        JSON.stringify([])
      );
    });
  });

  describe("addTodo", () => {
    it("should add todo to empty list", async () => {
      localStorageMock.todoList = JSON.stringify([]);
      const newTodo = createMockTodo();

      await useTodosStore.getState().addTodo(newTodo);

      expect(useTodosStore.getState().todoList).toEqual([newTodo]);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoList",
        JSON.stringify([newTodo])
      );
      expect(mockClient.putTodoList).toHaveBeenCalledWith([newTodo]);
      expect(mockToast.success).toHaveBeenCalledWith("Task Added Successfully");
    });

    it("should add todo to existing list", async () => {
      const existingTodo = createMockTodo({ id: "2", title: "Existing" });
      localStorageMock.todoList = JSON.stringify([existingTodo]);
      const newTodo = createMockTodo({ id: "1", title: "New" });

      await useTodosStore.getState().addTodo(newTodo);

      expect(useTodosStore.getState().todoList).toEqual([
        newTodo,
        existingTodo,
      ]);
      expect(mockClient.putTodoList).toHaveBeenCalledWith([
        newTodo,
        existingTodo,
      ]);
    });

    it("should throw error when user is not found", async () => {
      (useUserStore.getState as jest.Mock).mockReturnValue({
        user: { sub: "" },
      });
      const newTodo = createMockTodo();

      await expect(useTodosStore.getState().addTodo(newTodo)).rejects.toThrow(
        "User id not found"
      );
    });
  });

  describe("updateTodo", () => {
    it("should update existing todo", async () => {
      const originalTodo = createMockTodo({
        id: "1",
        title: "Original",
        status: "incomplete",
      });
      localStorageMock.todoList = JSON.stringify([originalTodo]);

      useTodosStore.getState().setTodos([originalTodo]);

      const updatedTodo = {
        ...originalTodo,
        title: "Updated",
        status: "complete",
      };

      await useTodosStore.getState().updateTodo(updatedTodo);

      expect(useTodosStore.getState().todoList).toEqual([updatedTodo]);
      expect(mockClient.putTodoList).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Task Updated successfully"
      );
    });

    it("should not update when todo is not in list", async () => {
      const existingTodo = createMockTodo({ id: "1" });
      localStorageMock.todoList = JSON.stringify([existingTodo]);

      useTodosStore.getState().setTodos([existingTodo]);

      const differentTodo = createMockTodo({ id: "2", title: "Different" });

      await useTodosStore.getState().updateTodo(differentTodo);

      expect(useTodosStore.getState().todoList).toEqual([existingTodo]);
    });
  });

  describe("deleteTodo", () => {
    it("should delete todo from list", async () => {
      const todo1 = createMockTodo({ id: "1" });
      const todo2 = createMockTodo({ id: "2" });
      localStorageMock.todoList = JSON.stringify([todo1, todo2]);

      useTodosStore.getState().setTodos([todo1, todo2]);

      await useTodosStore.getState().deleteTodo("1");

      expect(useTodosStore.getState().todoList).toEqual([todo2]);
      expect(mockClient.putTodoList).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Todo Deleted Successfully"
      );
    });

    it("should handle deleting non-existent todo", async () => {
      const todo1 = createMockTodo({ id: "1" });
      localStorageMock.todoList = JSON.stringify([todo1]);

      useTodosStore.getState().setTodos([todo1]);

      await useTodosStore.getState().deleteTodo("999");

      expect(useTodosStore.getState().todoList).toEqual([todo1]);
    });
  });

  describe("addComment", () => {
    beforeEach(() => {
      jest
        .spyOn(Date.prototype, "toISOString")
        .mockReturnValue("2023-01-01T00:00:00.000Z");
    });

    afterEach(() => {
      (Date.prototype.toISOString as jest.Mock).mockRestore();
    });

    it("should add comment to todo without existing comments", async () => {
      const todo = createMockTodo({ id: "1", comments: undefined });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore.getState().addComment("1", "New comment");

      expect(useTodosStore.getState().todoList?.[0].comments).toHaveLength(1);
      expect(useTodosStore.getState().todoList?.[0].comments?.[0]).toEqual({
        comment: "New comment",
        time: "2023-01-01T00:00:00.000Z",
      });
      expect(mockToast.success).toHaveBeenCalledWith(
        "Comment added successfully"
      );
    });

    it("should add comment to todo with existing comments", async () => {
      const existingComment = createMockComment({ comment: "Existing" });
      const todo = createMockTodo({ id: "1", comments: [existingComment] });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore.getState().addComment("1", "New comment");

      expect(useTodosStore.getState().todoList?.[0].comments).toHaveLength(2);
      expect(useTodosStore.getState().todoList?.[0].comments?.[0].comment).toBe(
        "New comment"
      );
      expect(useTodosStore.getState().todoList?.[0].comments?.[1].comment).toBe(
        "Existing"
      );
    });

    it("should not add comment to non-existent todo", async () => {
      const todo = createMockTodo({ id: "1" });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore.getState().addComment("999", "New comment");

      expect(useTodosStore.getState().todoList?.[0].comments).toEqual([]);
    });
  });

  describe("updateComment", () => {
    it("should update existing comment", async () => {
      const comment1 = createMockComment({ comment: "First" });
      const comment2 = createMockComment({ comment: "Second" });
      const todo = createMockTodo({ id: "1", comments: [comment1, comment2] });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore.getState().updateComment("1", 0, "Updated first");

      expect(useTodosStore.getState().todoList?.[0].comments?.[0].comment).toBe(
        "Updated first"
      );
      expect(useTodosStore.getState().todoList?.[0].comments?.[1].comment).toBe(
        "Second"
      );
      expect(mockToast.success).toHaveBeenCalledWith(
        "Comment updated successfully"
      );
    });

    it("should not update comment with invalid index", async () => {
      const comment = createMockComment({ comment: "First" });
      const todo = createMockTodo({ id: "1", comments: [comment] });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore
        .getState()
        .updateComment("1", 999, "Should not update");

      expect(useTodosStore.getState().todoList?.[0].comments?.[0].comment).toBe(
        "First"
      );
    });

    it("should not update comment for non-existent todo", async () => {
      const todo = createMockTodo({ id: "1", comments: [createMockComment()] });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore
        .getState()
        .updateComment("999", 0, "Should not update");

      expect(useTodosStore.getState().todoList?.[0].comments?.[0].comment).toBe(
        "Test comment"
      );
    });
  });

  describe("deleteComment", () => {
    it("should delete comment from todo", async () => {
      const comment1 = createMockComment({ comment: "First" });
      const comment2 = createMockComment({ comment: "Second" });
      const comment3 = createMockComment({ comment: "Third" });
      const todo = createMockTodo({
        id: "1",
        comments: [comment1, comment2, comment3],
      });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore.getState().deleteComment("1", 1);

      expect(useTodosStore.getState().todoList?.[0].comments).toHaveLength(2);
      expect(useTodosStore.getState().todoList?.[0].comments?.[0].comment).toBe(
        "First"
      );
      expect(useTodosStore.getState().todoList?.[0].comments?.[1].comment).toBe(
        "Third"
      );
      expect(mockToast.success).toHaveBeenCalledWith(
        "Comment deleted successfully"
      );
    });

    it("should handle deleting comment with invalid index", async () => {
      const comment = createMockComment({ comment: "First" });
      const todo = createMockTodo({ id: "1", comments: [comment] });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore.getState().deleteComment("1", 999);

      expect(useTodosStore.getState().todoList?.[0].comments).toHaveLength(1);
    });

    it("should handle deleting comment from non-existent todo", async () => {
      const todo = createMockTodo({ id: "1", comments: [createMockComment()] });
      localStorageMock.todoList = JSON.stringify([todo]);

      useTodosStore.getState().setTodos([todo]);

      await useTodosStore.getState().deleteComment("999", 0);

      expect(useTodosStore.getState().todoList?.[0].comments).toHaveLength(1);
    });
  });

  describe("setTodos", () => {
    it("should set todos and update localStorage", () => {
      const todos = [createMockTodo(), createMockTodo({ id: "2" })];

      useTodosStore.getState().setTodos(todos);

      expect(useTodosStore.getState().todoList).toEqual(todos);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "todoList",
        JSON.stringify(todos)
      );
    });

    it("should throw error when user is not found", () => {
      (useUserStore.getState as jest.Mock).mockReturnValue({
        user: { sub: "" },
      });

      expect(() => {
        useTodosStore.getState().setTodos([createMockTodo()]);
      }).toThrow("User id not found");
    });
  });
});
