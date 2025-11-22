import { create } from "zustand";
import { Todo, TodoComment } from "../types";
import zukeeper from "zukeeper";
import useUserStore from "./userStore";
import toast from "react-hot-toast";
import client from "../http/Client";

type TodosStore = {
  filterStatus: string;
  setFilterStatus: (filterStatus: string) => void;
  todoList: Todo[] | null;
  addTodo: (todo: Todo) => Promise<void>;
  updateTodo: (todo: Todo) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  setTodos: (todoList: Todo[]) => void;
  getInitialTodoList: () => Promise<void>;
  addComment: (todoId: string, comment: string) => Promise<void>;
  updateComment: (
    todoId: string,
    commentIndex: number,
    newComment: string
  ) => Promise<void>;
  deleteComment: (todoId: string, commentIndex: number) => Promise<void>;
};
const useTodosStore = create<TodosStore>(
  zukeeper((set: any) => ({
    filterStatus: "all",
    setFilterStatus: (filterStatus: string) => set(() => ({ filterStatus })),
    todoList: null,

    getInitialTodoList: async () => {
      const response = await client.getTodoList();
      const todoList = response.data.todoList;

      if (!todoList) {
        set(() => ({ todoList: null }));
        return;
      }

      if (todoList && todoList.length > 0) {
        set(() => ({ todoList: response.data.todoList }));
        window.localStorage.setItem("todoList", JSON.stringify(todoList));
      } else {
        set(() => ({ todoList: [] }));
        window.localStorage.setItem("todoList", JSON.stringify([]));
      }
    },

    addTodo: async (todo: Todo) => {
      const userId = useUserStore.getState().user.sub ?? "";
      if (userId === "") {
        throw new Error("User id not found");
      }

      const todoListString = window.localStorage.getItem("todoList");

      let todoListArr: Todo[] = [];
      try {
        todoListArr = JSON.parse(todoListString ?? "{}") as Todo[];
      } catch (error) {
        console.error(error);
        toast.error("Error adding todo");
      }
      const newTodoListArr = todoListArr ? [todo, ...todoListArr] : [todo];

      set(() => ({
        todoList: newTodoListArr,
      }));

      window.localStorage.setItem("todoList", JSON.stringify(newTodoListArr));

      const response = await client.putTodoList(newTodoListArr);

      if (response) {
        toast.success("Task Added Successfully");
      }
    },
    updateTodo: async (updatedTodo: Todo) => {
      const userId = useUserStore.getState().user.sub ?? "";
      if (userId === "") {
        throw new Error("User id not found");
      }

      const todoList = window.localStorage.getItem("todoList");

      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        todoListArr.forEach((todo: Todo) => {
          if (todo.id === updatedTodo.id) {
            todo.status = updatedTodo.status;
            todo.title = updatedTodo.title;
            todo.comments = updatedTodo.comments;
          }
        });

        window.localStorage.setItem("todoList", JSON.stringify(todoListArr));

        set((state: any) => ({
          todoList: state.todoList.map((todo: Todo) => {
            return todo.id === updatedTodo.id ? updatedTodo : todo;
          }),
        }));

        const response = await client.putTodoList(todoListArr);
        if (response) toast.success("Task Updated successfully");
      }
    },
    addComment: async (todoId: string, comment: string) => {

      const userId = useUserStore.getState().user.sub ?? "";
      if (userId === "") {
        throw new Error("User id not found");
      }

      const todoList = window.localStorage.getItem("todoList");

      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        const newComment: TodoComment = {
          comment,
          time: new Date().toISOString(),
        };
        todoListArr.forEach((todo: Todo) => {
          if (todo.id === todoId) {
            todo.comments = todo.comments || [];
            todo.comments.unshift(newComment);
          }
        });
        window.localStorage.setItem("todoList", JSON.stringify(todoListArr));
        set(() => ({
          todoList: todoListArr,
        }));
        const response = await client.putTodoList(todoListArr);
        if (response) toast.success("Comment added successfully");
      }
    },
    updateComment: async (
      todoId: string,
      commentIndex: number,
      newComment: string
    ) => {
      const userId = useUserStore.getState().user.sub ?? "";
      if (userId === "") {
        throw new Error("User id not found");
      }
      const todoList = window.localStorage.getItem("todoList");
      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        todoListArr.forEach((todo: Todo) => {
          if (
            todo.id === todoId &&
            todo.comments &&
            todo.comments[commentIndex]
          ) {
            todo.comments[commentIndex].comment = newComment;
          }
        });
        window.localStorage.setItem("todoList", JSON.stringify(todoListArr));
        set(() => ({
          todoList: todoListArr,
        }));
        const response = await client.putTodoList(todoListArr);
        if (response) toast.success("Comment updated successfully");
      }
    },
    deleteComment: async (todoId: string, commentIndex: number) => {
      const userId = useUserStore.getState().user.sub ?? "";
      if (userId === "") {
        throw new Error("User id not found");
      }
      const todoList = window.localStorage.getItem("todoList");
      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        todoListArr.forEach((todo: Todo) => {
          if (todo.id === todoId && todo.comments) {
            todo.comments.splice(commentIndex, 1);
          }
        });
        window.localStorage.setItem("todoList", JSON.stringify(todoListArr));
        set(() => ({
          todoList: todoListArr,
        }));
        const response = await client.putTodoList(todoListArr);
        if (response) toast.success("Comment deleted successfully");
      }
    },
    deleteTodo: async (id: string) => {
      const userId = useUserStore.getState().user.sub ?? "";
      if (userId === "") {
        throw new Error("User id not found");
      }
      const todoList = window.localStorage.getItem("todoList");
      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        todoListArr.forEach((todo: Todo, index: number) => {
          if (todo.id === id) {
            todoListArr.splice(index, 1);
          }
        });
        window.localStorage.setItem("todoList", JSON.stringify(todoListArr));
        set((state: any) => ({
          todoList: state.todoList.filter((todo: Todo) => {
            return todo.id !== id;
          }),
        }));
        const response = await client.putTodoList(todoListArr);
        if (response) toast.success("Todo Deleted Successfully");
      }
    },
    setTodos: (todoList: Todo[]) => {
      const userId = useUserStore.getState().user.sub ?? "";
      if (userId === "") {
        throw new Error("User id not found");
      }

      set(() => ({ todoList }));
      
      window.localStorage.setItem("todoList", JSON.stringify(todoList));
    },
  }))
);

declare global {
  interface Window {
    store: typeof useTodosStore;
  }
}

window.store = useTodosStore;

export default useTodosStore;
