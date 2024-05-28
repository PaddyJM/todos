import { create } from "zustand";
import { Todo } from "../types";
import zukeeper from "zukeeper";
import useUserStore from "./userStore";
import toast from "react-hot-toast";
import client from "../http/Client";

type TodosStore = {
  filterStatus: string;
  setFilterStatus: (filterStatus: string) => void;
  todoList: Todo[] | null;
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  setTodos: (todoList: Todo[]) => void;
  getInitialTodoList: () => void;
};
const useTodosStore = create<TodosStore>(
  zukeeper((set: any) => ({
    filterStatus: "all",
    setFilterStatus: (filterStatus: string) => set(() => ({ filterStatus })),
    todoList: null,
    getInitialTodoList: async () => {
      const response = await client.getTodoList();
      const todoList = response.data.todoList;
      if(!todoList) {
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
