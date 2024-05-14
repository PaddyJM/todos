import { ChangeEvent, useState } from "react";
import Button, { SelectButton } from "./Button";
import styles from "../styles/modules/app.module.scss";
import TodoModal from "./TodoModal";
import { useAuth0 } from "@auth0/auth0-react";
import useTodosStore from "../stores/todosStore";

function AppHeader() {
  const [modalOpen, setModalOpen] = useState(false);
  const filterStatus = useTodosStore((state) => state.filterStatus);
  const setFilterStatus = useTodosStore((state) => state.setFilterStatus);

  function UpdateFilter(e: ChangeEvent<HTMLSelectElement>) {
    setFilterStatus(e.target.value);
  }

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
      <SelectButton
        id="status"
        onChange={(e) => {
          UpdateFilter(e);
        }}
        value={filterStatus}
      >
        <option value="all">All</option>
        <option value="incomplete">Incomplete</option>
        <option value="complete">Completed</option>
      </SelectButton>
      <Button type="button" variant="primary" onClick={() => logout()}>
        Log out
      </Button>
      <TodoModal type="add" modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </div>
  );
}

export default AppHeader;
