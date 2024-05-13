import { create } from "zustand";
import { Todo } from "../types";
import zukeeper from "zukeeper";
import axios from "axios";

type TodosStore = {
  filterStatus: string;
  setFilterStatus: (filterStatus: string) => void;
  todoList: Todo[];
  addTodo: (userId: string, todo: Todo) => void;
  updateTodo: (userId: string, todo: Todo) => void;
  deleteTodo: (id: string) => void;
  setTodos: (todoList: Todo[]) => void;
};

const initialTodoList = JSON.parse(
  window.localStorage.getItem("todoList") ?? "[]"
) as Todo[];

const useTodosStore = create<TodosStore>(
  zukeeper((set: any) => ({
    filterStatus: "all",
    setFilterStatus: (filterStatus: string) => set(() => ({ filterStatus })),
    todoList: initialTodoList ?? ([] as Todo[]),
    addTodo: (userId: string, todo: Todo) => {
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
        axios.put("http://localhost:3000/todos", {
          id: userId,
          todoList: todoListArr,
        });
      } else {
        window.localStorage.setItem(
          "todoList",
          JSON.stringify([
            {
              ...todo,
            },
          ])
        );
        axios.put("http://localhost:3000/todos", {
          id: userId,
          todoList: [
            {
              ...todo,
            },
          ],
        });
      }
    },
    updateTodo: (userId: string, updatedTodo: Todo) => {
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
        axios.put("http://localhost:3000/todos", {
          id: userId,
          todoList: todoListArr,
        });
      }
    },
    deleteTodo: (id: string) => {
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
