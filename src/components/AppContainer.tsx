import { useAuth0 } from "@auth0/auth0-react";
import AppContent from "./AppContent";
import AppHeader from "./AppHeader";
import Button from "./Button";
import useUserStore from "../stores/userStore";
import styles from "../styles/modules/app.module.scss";

function AppContainer() {
  const isAuth = process.env.REACT_APP_AUTH ?? "true";

  const setUser = useUserStore((state) => state.setUser);

  const { isLoading, isAuthenticated, error, loginWithRedirect, user } =
    useAuth0();

  if (isAuth === "false") {
    setUser({ sub: "test" });
    return (
      <>
        <AppHeader />
        <AppContent />
      </>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated && user) {
    setUser(user);
    return (
      <>
        <AppHeader />
        <AppContent />
      </>
    );
  }

  return (
      <Button
        type="button"
        variant="center"
        onClick={() => loginWithRedirect()}
      >
        Log in
      </Button>
  );
}

export default AppContainer;
