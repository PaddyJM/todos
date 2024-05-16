import { Toaster } from "react-hot-toast";
import PageTitle from "./components/PageTitle";
import styles from "./styles/modules/app.module.scss";
import { Auth0Provider } from "@auth0/auth0-react";
import AppContainer from "./components/AppContainer";

function App() {
  return (
    <>
      <Auth0Provider
        domain={process.env.REACT_APP_AUTH0_DOMAIN!}
        clientId={process.env.REACT_APP_AUTH0_CLIENT_ID!}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        }}
      >
        <div className="container">
          <PageTitle>TODO List</PageTitle>
          <div className={styles.app__wrapper}>
            <AppContainer />
          </div>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontSize: "1.4rem",
            },
          }}
        />
      </Auth0Provider>
    </>
  );
}

export default App;
