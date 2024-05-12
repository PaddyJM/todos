import { useAuth0 } from "@auth0/auth0-react";
import AppContent from "./AppContent";
import AppHeader from "./AppHeader";
import Button from "./Button";

function AppContainer() {
  const { isLoading, isAuthenticated, error, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
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
