import { useEffect, useState } from "react";
import {
  MdDelete,
  MdEdit,
  MdChatBubble,
  MdChatBubbleOutline,
} from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import Linkify from "linkify-react";
import toast from "react-hot-toast";
import styles from "../styles/modules/todoItem.module.scss";
import { getClasses } from "../utils/getClasses";
import { formatDate } from "../utils/formatDate";
import CheckButton from "./CheckButton";
import Button from "./Button";
import AutoResizeTextarea from "./AutoResizeTextarea";
import { Todo } from "../types";
import useTodosStore from "../stores/todosStore";

function TodoItem({ todo }: { todo: Todo }) {
  const [checked, setChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(
    null
  );
  const [editingCommentText, setEditingCommentText] = useState("");

  useEffect(() => {
    if (todo.status === "complete") {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, [todo.status]);

  const { updateTodo, deleteTodo, addComment, updateComment, deleteComment } =
    useTodosStore();

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
    setIsEditing(true);
    setEditingTitle(todo.title);
  };

  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (editingTitle.trim() === "") {
      toast.error("Please enter a title");
      return;
    }
    if (todo.title !== editingTitle) {
      updateTodo({ ...todo, title: editingTitle });
    }
    setIsEditing(false);
  };

  const handleCancelTodoEdit = () => {
    setIsEditing(false);
    setEditingTitle("");
  };

  const handleToggleComments = () => {
    setIsCommentsExpanded(!isCommentsExpanded);
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (commentText.trim()) {
      addComment(todo.id, commentText);
      setCommentText("");
    }
  };

  const handleEditComment = (index: number) => {
    setEditingCommentIndex(index);
    setEditingCommentText(comments[index].comment);
  };

  const handleUpdateComment = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (editingCommentIndex !== null && editingCommentText.trim()) {
      updateComment(todo.id, editingCommentIndex, editingCommentText);
      setEditingCommentIndex(null);
      setEditingCommentText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentIndex(null);
    setEditingCommentText("");
  };

  const handleDeleteComment = (index: number) => {
    deleteComment(todo.id, index);
  };

  const comments = todo.comments || [];

  const linkifyOptions = {
    target: "_blank",
    rel: "noopener noreferrer",
    defaultProtocol: "https",
  };

  return (
    <>
      <div className={styles.itemWrapper}>
        <div className={styles.item}>
          {isEditing ? (
            <form className={styles.todoEditForm} onSubmit={handleSaveEdit}>
              <div className={styles.todoEditInputs}>
                <AutoResizeTextarea
                  className={styles.todoEditInput}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  autoFocus
                  onSubmit={() => handleSaveEdit()}
                />
              </div>
              <div className={styles.todoEditButtons}>
                <Button type="submit" variant="primary">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelTodoEdit}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className={styles.todoDetails}>
                <CheckButton checked={checked} handleCheck={handleCheck} />
                <div>
                  <p
                    className={getClasses([
                      styles.todoText,
                      todo.status === "complete" &&
                      styles["todoText--completed"],
                    ])}
                    style={{ wordBreak: "break-word" }}
                  >
                    <Linkify options={linkifyOptions}>{todo.title}</Linkify>
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
                  className={getClasses([
                    styles.iconComments,
                    comments.length > 0 && styles.iconCommentsHighlighted,
                    isCommentsExpanded && styles.iconCommentsActive,
                  ])}
                  onClick={handleToggleComments}
                  onKeyDown={handleToggleComments}
                  tabIndex={0}
                  role="button"
                >
                  {isCommentsExpanded ? (
                    <MdChatBubble />
                  ) : (
                    <MdChatBubbleOutline />
                  )}
                </div>
              </div>
            </>
          )}
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
                <AutoResizeTextarea
                  className={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onSubmit={() => handleAddComment()}
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
                      {editingCommentIndex === index ? (
                        <form
                          className={styles.commentEditForm}
                          onSubmit={handleUpdateComment}
                        >
                          <AutoResizeTextarea
                            className={styles.commentInput}
                            value={editingCommentText}
                            onChange={(e) =>
                              setEditingCommentText(e.target.value)
                            }
                            autoFocus
                            onSubmit={() => handleUpdateComment()}
                          />
                          <div className={styles.commentEditButtons}>
                            <Button type="submit" variant="primary">
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className={styles.commentContent}>
                            <p className={styles.commentText}>
                              <Linkify options={linkifyOptions}>
                                {comment.comment}
                              </Linkify>
                            </p>
                            <p className={styles.commentTime}>
                              {formatDate(comment.time)}
                            </p>
                          </div>
                          <div className={styles.commentActions}>
                            <div
                              className={styles.icon}
                              onClick={() => handleDeleteComment(index)}
                              onKeyDown={() => handleDeleteComment(index)}
                              tabIndex={0}
                              role="button"
                            >
                              <MdDelete />
                            </div>
                            <div
                              className={styles.icon}
                              onClick={() => handleEditComment(index)}
                              onKeyDown={() => handleEditComment(index)}
                              tabIndex={0}
                              role="button"
                            >
                              <MdEdit />
                            </div>
                          </div>
                        </>
                      )}
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
    </>
  );
}

export default TodoItem;
