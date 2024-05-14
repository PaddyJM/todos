import { create } from "zustand";
import { Todo } from "../types";
import zukeeper from "zukeeper";
import Client from "../http/Client";
import useUserStore from "./userStore";

type TodosStore = {
  filterStatus: string;
  setFilterStatus: (filterStatus: string) => void;
  todoList: Todo[];
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  setTodos: (todoList: Todo[]) => void;
};

const client = new Client("http://localhost:3000/todos");

let initialTodoList: Todo[] = [];
try {
  initialTodoList = JSON.parse(window.localStorage.getItem("todoList") ?? "[]");
} catch (error) {
  console.error("Error parsing todoList from localStorage", error);
}

const useTodosStore = create<TodosStore>(
  zukeeper((set: any) => ({
    filterStatus: "all",
    setFilterStatus: (filterStatus: string) => set(() => ({ filterStatus })),
    todoList: initialTodoList ?? ([] as Todo[]),
    addTodo: (todo: Todo) => {
      const userId = useUserStore.getState().user.sub ?? "";
      if (userId === "") {
        throw new Error("User id not found");
      }
      set((state: any) => ({
        todoList: [...state.todoList, todo],
      }));

      const todoList = window.localStorage.getItem("todoList");

      if (todoList) {
        const todoListArr = JSON.parse(todoList) as Todo[];
        todoListArr.push({
          ...todo,
        });

        window.localStorage.setItem("todoList", JSON.stringify(todoListArr));

        client.putTodoList(userId, todoListArr);
      } else {
        window.localStorage.setItem(
          "todoList",
          JSON.stringify([
            {
              ...todo,
            },
          ])
        );
        client.putTodoList(userId, [
          {
            ...todo,
          },
        ]);
      }
    },
    updateTodo: (updatedTodo: Todo) => {
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
          }
        });
        window.localStorage.setItem("todoList", JSON.stringify(todoListArr));
        set((state: any) => ({
          todoList: state.todoList.map((todo: Todo) => {
            return todo.id === updatedTodo.id ? updatedTodo : todo;
          }),
        }));
        client.putTodoList(userId, todoListArr);
      }
    },
    deleteTodo: (id: string) => {
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
        client.putTodoList(userId, todoListArr);
      }
    },
    setTodos: (todoList: Todo[]) => {
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
