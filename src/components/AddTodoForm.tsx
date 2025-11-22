import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import styles from "../styles/modules/app.module.scss";
import Button from "./Button";
import AutoResizeTextarea from "./AutoResizeTextarea";
import useTodosStore from "../stores/todosStore";

function AddTodoForm() {
  const [title, setTitle] = useState("");
  const [showLoadingState, setShowLoadingState] = useState(false);

  const { addTodo, isInitialLoadComplete } = useTodosStore();

  useEffect(() => {
    if (isInitialLoadComplete) {
      setShowLoadingState(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoadingState(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [isInitialLoadComplete]);

  const isDisabled = !isInitialLoadComplete && showLoadingState;

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (title === "") {
      toast.error("Please enter a title");
      return;
    }
    if (title) {
      addTodo({
        id: uuid(),
        title,
        status: "incomplete",
        time: new Date().toISOString(),
      });
      setTitle("");
    }
  };

  return (
    <form className={styles.addTodoForm} onSubmit={handleSubmit}>
      <AutoResizeTextarea
        className={styles.addTodoInput}
        placeholder="Add a new todo..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onSubmit={() => handleSubmit()}
        disabled={isDisabled}
      />
      <Button type="submit" variant="primary" disabled={isDisabled}>
        Add Task
      </Button>
    </form>
  );
}

export default AddTodoForm;
