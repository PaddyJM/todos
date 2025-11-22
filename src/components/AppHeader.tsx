import Button from "./Button";
import styles from "../styles/modules/app.module.scss";
import { useAuth0 } from "@auth0/auth0-react";

function AppHeader() {
  const { logout } = useAuth0();

  return (
    <div className={styles.appHeader}>
      <h1 className={styles.headerTitle}>TODO List</h1>
      <Button type="button" variant="primary" onClick={() => logout()}>
        Log out
      </Button>
    </div>
  );
}

export default AppHeader;
