import { AnimatePresence, Reorder, motion } from "framer-motion";
import useTodosStore from "../stores/todosStore";
import styles from "../styles/modules/app.module.scss";
import TodoItem from "./TodoItem";
import { Todo } from "../types";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const container = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};
const child = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

function AppContent() {
  const { getAccessTokenSilently } = useAuth0();

  let todoList = useTodosStore((state) => state.todoList);
  const filterStatus = useTodosStore((state) => state.filterStatus);
  const setTodos = useTodosStore((state) => state.setTodos);
  const getInitialTodoList = useTodosStore((state) => state.getInitialTodoList);

  const getFilteredTodoList = (todoList: Todo[], status: string) => {
    return todoList.filter((item) => {
      if (status === "all") {
        return true;
      }
      return item.status === filterStatus;
    });
  };

  const [token, setToken] = useState(window.localStorage.getItem("token"));

  useEffect(() => {
    async function getToken() {
      const token = await getAccessTokenSilently();
      setToken(token);
      window.localStorage.setItem("token", token);
    }

    if (!token) {
      getToken();
    }
  }, []);

  if (!token) {
    return (
      <>
        <br />
        <motion.p variants={child} className={styles.emptyText}>
          Loading...
        </motion.p>
      </>
    );
  }

  if (todoList && todoList.length === 0) {
    getInitialTodoList();
    return (
      <>
        <br />
        <motion.p variants={child} className={styles.emptyText}>
          Loading...
        </motion.p>
      </>
    );
  }

  if (!todoList) {
    return (
      <>
        <br />
        <motion.p variants={child} className={styles.emptyText}>
          No Todo List has been added yet
        </motion.p>
      </>
    );
  }

  return (
    <motion.div
      className={styles.content__wrapper}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {todoList && todoList.length > 0 ? (
          <Reorder.Group axis="y" values={todoList} onReorder={setTodos}>
            {getFilteredTodoList(todoList, filterStatus).map((todo) => (
              <Reorder.Item key={todo.id} value={todo}>
                <TodoItem key={todo.id} todo={todo} />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <motion.p variants={child} className={styles.emptyText}>
            No Todos
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default AppContent;
