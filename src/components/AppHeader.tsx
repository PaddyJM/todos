import { useState } from "react";
import Button from "./Button";
import styles from "../styles/modules/app.module.scss";
import TodoModal from "./TodoModal";
import { useAuth0 } from "@auth0/auth0-react";

function AppHeader() {
  const [modalOpen, setModalOpen] = useState(false);

  const { logout } = useAuth0();

  return (
    <div className={styles.appHeader}>
      <Button
        type="button"
        variant="primary"
        onClick={() => setModalOpen(true)}
      >
        Add Task
      </Button>
      <Button type="button" variant="primary" onClick={() => logout()}>
        Log out
      </Button>
      <TodoModal type="add" modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </div>
  );
}

export default AppHeader;
