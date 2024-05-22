import { AnimatePresence, Reorder, motion } from "framer-motion";
import useTodosStore from "../stores/todosStore";
import styles from "../styles/modules/app.module.scss";
import TodoItem from "./TodoItem";
import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import client from "../http/Client";

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
  const getInitialTodoList = useTodosStore((state) => state.getInitialTodoList);

  useEffect(() => {
    client.setTokenGenerator(getAccessTokenSilently);
    getInitialTodoList();
  }, [getAccessTokenSilently]);

  let todoList = useTodosStore((state) => state.todoList);
  const setTodos = useTodosStore((state) => state.setTodos);

  if (todoList && todoList.length === 0) {
    return (
      <>
        <br />
        <motion.p variants={child} className={styles.emptyText}>
          There are no todos; please add some
        </motion.p>
      </>
    );
  }

  if (!todoList) {
    return (
      <>
        <br />
        <motion.p variants={child} className={styles.emptyText}>
          Loading...
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
            {todoList.map((todo) => (
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
