import { create } from "zustand";
import { Todo, TodoComment } from "../types";
import zukeeper from "zukeeper";
import useUserStore from "./userStore";
import toast from "react-hot-toast";
import client from "../http/Client";

const validateUser = () => {
  const userId = useUserStore.getState().user.sub ?? "";
  if (userId === "") {
    throw new Error("User id not found");
  }
  return userId;
};

const getTodoListFromStorage = (): Todo[] | null => {
  const todoList = window.localStorage.getItem("todoList");
  if (!todoList) return null;
  try {
    return JSON.parse(todoList);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const saveTodoListToStorage = (todoList: Todo[]) => {
  window.localStorage.setItem("todoList", JSON.stringify(todoList));
};

const syncTodoList = async (todoList: Todo[], set: any) => {
  saveTodoListToStorage(todoList);
  set(() => ({ todoList }));
  return await client.putTodoList(todoList);
};

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
      validateUser();
      const todoList = getTodoListFromStorage() || [];
      const updatedTodoList = [todo, ...todoList];
      const response = await syncTodoList(updatedTodoList, set);
      if (response) toast.success("Task Added Successfully");
    },
    updateTodo: async (updatedTodo: Todo) => {
      validateUser();
      const todoList = getTodoListFromStorage();
      if (!todoList) return;
      const updatedTodoList = todoList.map((todo) =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      );
      const response = await syncTodoList(updatedTodoList, set);
      if (response) toast.success("Task Updated successfully");
    },
    addComment: async (todoId: string, comment: string) => {
      validateUser();
      const todoList = getTodoListFromStorage();
      if (!todoList) return;
      const newComment: TodoComment = {
        comment,
        time: new Date().toISOString(),
      };
      const updatedTodoList = todoList.map((todo) => {
        if (todo.id === todoId) {
          return {
            ...todo,
            comments: [newComment, ...(todo.comments || [])],
          };
        }
        return todo;
      });
      const response = await syncTodoList(updatedTodoList, set);
      if (response) toast.success("Comment added successfully");
    },
    updateComment: async (
      todoId: string,
      commentIndex: number,
      newComment: string
    ) => {
      validateUser();
      const todoList = getTodoListFromStorage();
      if (!todoList) return;
      const updatedTodoList = todoList.map((todo) => {
        if (todo.id === todoId && todo.comments?.[commentIndex]) {
          const updatedComments = [...todo.comments];
          updatedComments[commentIndex] = {
            ...updatedComments[commentIndex],
            comment: newComment,
          };
          return { ...todo, comments: updatedComments };
        }
        return todo;
      });
      const response = await syncTodoList(updatedTodoList, set);
      if (response) toast.success("Comment updated successfully");
    },
    deleteComment: async (todoId: string, commentIndex: number) => {
      validateUser();
      const todoList = getTodoListFromStorage();
      if (!todoList) return;
      const updatedTodoList = todoList.map((todo) => {
        if (todo.id === todoId && todo.comments) {
          const updatedComments = todo.comments.filter(
            (_, index) => index !== commentIndex
          );
          return { ...todo, comments: updatedComments };
        }
        return todo;
      });
      const response = await syncTodoList(updatedTodoList, set);
      if (response) toast.success("Comment deleted successfully");
    },
    deleteTodo: async (id: string) => {
      validateUser();
      const todoList = getTodoListFromStorage();
      if (!todoList) return;
      const updatedTodoList = todoList.filter((todo) => todo.id !== id);
      const response = await syncTodoList(updatedTodoList, set);
      if (response) toast.success("Todo Deleted Successfully");
    },
    setTodos: (todoList: Todo[]) => {
      validateUser();
      set(() => ({ todoList }));
      saveTodoListToStorage(todoList);
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
