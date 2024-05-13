import { create } from "zustand";
import { Todo } from "../types";
import zukeeper from "zukeeper";

type TodosStore = {
  filterStatus: string;
  setFilterState: (filterStatus: string) => void;
  todoList: Todo[];
  addTodo: (todo: Todo) => void;
  updateTodo: (todo: Todo) => void;
  deleteTodo: (id: string) => void;
  setTodos: (todoList: Todo[]) => void;
};

const initialTodoList = JSON.parse(
  window.localStorage.getItem("todoList") ?? "[]"
) as Todo[];

const useTodosStore = create<TodosStore>(
  zukeeper((set: any) => ({
    filterStatus: "all",
    setFilterState: (filterStatus: string) => set(() => ({ filterStatus })),
    todoList: initialTodoList ?? ([] as Todo[]),
    addTodo: (todo: Todo) => {
      set((state: any) => ({
        todoList: [...state.todoList, todo],
      }));
      const todoList = window.localStorage.getItem("todoList");
      if (todoList) {
        const todoListArr = JSON.parse(todoList);
        todoListArr.push({
          ...todo,
        });
        window.localStorage.setItem("todoList", JSON.stringify(todoListArr));
      } else {
        window.localStorage.setItem(
          "todoList",
          JSON.stringify([
            {
              ...todo,
            },
          ])
        );
      }
    },
    updateTodo: (updatedTodo: Todo) => {
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
      set(() => ({ todoList }))
      window.localStorage.setItem("todoList", JSON.stringify(todoList));},
  }))
);

declare global {
  interface Window {
    store: typeof useTodosStore;
  }
}

window.store = useTodosStore;

export default useTodosStore;
