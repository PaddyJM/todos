import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import AppContent from "./AppContent";
import AppHeader from "./AppHeader";
import Button from "./Button";
import useUserStore from "../stores/userStore";
import styles from "../styles/modules/app.module.scss";
import Cookies from "js-cookie";

function AppContainer() {
  const isAuth = process.env.REACT_APP_AUTH ?? "true";
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const setUser = useUserStore((state) => state.setUser);

  const { isLoading, isAuthenticated, error, loginWithRedirect, user, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    if (isAuthenticated && user) {
      setUser(user);
    }
  }, [isAuthenticated, user, setUser]);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (isAuth === "false") {
        setIsCheckingAuth(false);
        return;
      }

      const token = Cookies.get("token");
      if (token && !isAuthenticated && !isLoading) {
        try {
          await getAccessTokenSilently();
        } catch (error) {
          console.log("Silent authentication failed:", error);
          Cookies.remove("token");
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuthentication();
  }, [isAuth, isAuthenticated, isLoading, getAccessTokenSilently]);

  if (isAuth === "false") {
    setUser({ sub: "test" });
    return (
      <>
        <AppHeader />
        <AppContent />
      </>
    );
  }

  if (isLoading || isCheckingAuth) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated && user) {
    return (
      <>
        <AppHeader />
        <AppContent />
      </>
    );
  }

  return (
    <>
      <h1
        className={styles.headerTitle}
        style={{ textAlign: "center", marginBottom: "2rem" }}
      >
        TODO List
      </h1>
      <Button
        type="button"
        variant="center"
        onClick={() => loginWithRedirect()}
      >
        Log in
      </Button>
    </>
  );
}

export default AppContainer;
