export interface RootTodoState {
  todo: TodoState;
}

export interface TodoState {
  todoList: Todo[];
  filterStatus: string;
}

export interface TodoComment {
  comment: string;
  time: string;
}

export interface Todo {
  id: string;
  title: string;
  status: string;
  time: string;
  comments?: TodoComment[];
}
