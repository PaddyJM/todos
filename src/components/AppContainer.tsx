import { useAuth0 } from "@auth0/auth0-react";
import AppContent from "./AppContent";
import AppHeader from "./AppHeader";
import Button from "./Button";
import useUserStore from "../stores/userStore";
import useTodosStore from "../stores/todosStore";

function AppContainer() {
  const { isLoading, isAuthenticated, error, loginWithRedirect, user } =
    useAuth0();

  const setUser = useUserStore((state) => state.setUser);

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
    <div>
      <Button
        type="button"
        variant="primary"
        onClick={() => loginWithRedirect()}
      >
        Log in
      </Button>
    </div>
  );
}

export default AppContainer;
