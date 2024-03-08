import { Toaster } from "react-hot-toast";
import PageTitle from "./components/PageTitle";
import styles from "./styles/modules/app.module.scss";
import { Auth0Provider } from "@auth0/auth0-react";
import AppContainer from "./components/AppContainer";

function App() {
  return (
    <>
      <Auth0Provider
        domain={"dev-5akspl1d.us.auth0.com"}
        clientId={"iqeWLt3k2bDiSNaYQYlOYL96mHocj97f"}
        authorizationParams={{ redirect_uri: window.location.origin }}
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
