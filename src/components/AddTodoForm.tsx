import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import styles from "../styles/modules/app.module.scss";
import Button from "./Button";
import useTodosStore from "../stores/todosStore";

function AddTodoForm() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("incomplete");

  const { addTodo } = useTodosStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title === "") {
      toast.error("Please enter a title");
      return;
    }
    if (title && status) {
      addTodo({
        id: uuid(),
        title,
        status,
        time: new Date().toISOString(),
      });
      setTitle("");
      setStatus("incomplete");
      const textarea = e.currentTarget.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  };

  return (
    <form className={styles.addTodoForm} onSubmit={handleSubmit}>
      <div className={styles.addTodoInputs}>
        <textarea
          className={styles.addTodoInput}
          placeholder="Add a new todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
        <select
          className={styles.addTodoSelect}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="incomplete">Incomplete</option>
          <option value="complete">Completed</option>
        </select>
      </div>
      <Button type="submit" variant="primary">
        Add Task
      </Button>
    </form>
  );
}

export default AddTodoForm;

