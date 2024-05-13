import { format } from "date-fns";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import styles from "../styles/modules/todoItem.module.scss";
import { getClasses } from "../utils/getClasses";
import CheckButton from "./CheckButton";
import TodoModal from "./TodoModal";
import { Todo } from "../types";
import useTodosStore from "../app/store";
import { useAuth0 } from "@auth0/auth0-react";

function TodoItem({ todo }: { todo: Todo }) {
  const [checked, setChecked] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  useEffect(() => {
    if (todo.status === "complete") {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [todo.status]);

  const { updateTodo, deleteTodo } = useTodosStore();

  const auth = useAuth0();

  const handleCheck = () => {
    setChecked(!checked);
    updateTodo(auth.user?.sub ?? "", {
      ...todo,
      status: checked ? "incomplete" : "complete",
    });
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
    toast.success("Todo Deleted Successfully");
  };

  const handleUpdate = () => {
    setUpdateModalOpen(true);
  };

  return (
    <>
      <div className={styles.item}>
        <div className={styles.todoDetails}>
          <CheckButton checked={checked} handleCheck={handleCheck} />
          <div>
            <p
              className={getClasses([
                styles.todoText,
                todo.status === "complete" && styles["todoText--completed"],
              ])}
            >
              {todo.title}
            </p>
            <p className={styles.time}>
              {format(new Date(todo.time), "p, MM/dd/yyyy")}
            </p>
          </div>
        </div>
        <div className={styles.todoActions}>
          <div
            className={styles.icon}
            onClick={() => handleDelete()}
            onKeyDown={() => handleDelete()}
            tabIndex={0}
            role="button"
          >
            <MdDelete />
          </div>
          <div
            className={styles.icon}
            onClick={() => handleUpdate()}
            onKeyDown={() => handleUpdate()}
            tabIndex={0}
            role="button"
          >
            <MdEdit />
          </div>
        </div>
      </div>
      <TodoModal
        type="update"
        modalOpen={updateModalOpen}
        setModalOpen={setUpdateModalOpen}
        todo={todo}
      />
    </>
  );
}

export default TodoItem;
