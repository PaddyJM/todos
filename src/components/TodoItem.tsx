import { useEffect, useState } from "react";
import {
  MdDelete,
  MdEdit,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../styles/modules/todoItem.module.scss";
import { getClasses } from "../utils/getClasses";
import { formatDate } from "../utils/formatDate";
import CheckButton from "./CheckButton";
import TodoModal from "./TodoModal";
import Button from "./Button";
import { Todo } from "../types";
import useTodosStore from "../stores/todosStore";

function TodoItem({ todo }: { todo: Todo }) {
  const [checked, setChecked] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (todo.status === "complete") {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [todo.status]);

  const { updateTodo, deleteTodo, addComment } = useTodosStore();

  const handleCheck = () => {
    setChecked(!checked);
    updateTodo({
      ...todo,
      status: checked ? "incomplete" : "complete",
    });
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
  };

  const handleUpdate = () => {
    setUpdateModalOpen(true);
  };

  const handleToggleComments = () => {
    setIsCommentsExpanded(!isCommentsExpanded);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(todo.id, commentText);
      setCommentText("");
    }
  };

  const comments = todo.comments || [];

  return (
    <>
      <div className={styles.itemWrapper}>
        <div className={styles.item}>
          <div className={styles.todoDetails}>
            <CheckButton checked={checked} handleCheck={handleCheck} />
            <div>
              <p
                className={getClasses([
                  styles.todoText,
                  todo.status === "complete" && styles["todoText--completed"],
                ])}
                style={{ wordBreak: "break-word" }}
              >
                {todo.title}
              </p>
              <p className={styles.time}>{formatDate(todo.time)}</p>
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
            <div
              className={styles.icon}
              onClick={handleToggleComments}
              onKeyDown={handleToggleComments}
              tabIndex={0}
              role="button"
            >
              {isCommentsExpanded ? (
                <MdKeyboardArrowUp />
              ) : (
                <MdKeyboardArrowDown />
              )}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isCommentsExpanded && (
            <motion.div
              className={styles.commentsSection}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.commentsHeader}>
                <h3 className={styles.commentsTitle}>Comments</h3>
              </div>
              <form className={styles.commentForm} onSubmit={handleAddComment}>
                <input
                  type="text"
                  className={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className={styles.commentButton}>
                  <Button type="submit" variant="primary">
                    Add comment
                  </Button>
                </div>
              </form>
              <div className={styles.commentsList}>
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div key={index} className={styles.commentItem}>
                      <p className={styles.commentText}>{comment.comment}</p>
                      <p className={styles.commentTime}>
                        {formatDate(comment.time)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className={styles.noComments}>No comments yet</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
