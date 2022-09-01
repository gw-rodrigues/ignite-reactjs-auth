import type { GetServerSidePropsContext, NextPage } from "next";
import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import styles from "../styles/Home.module.css";
import { withSSRAuth } from "../utils/withSSRAuth";

const Dashboard: NextPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) return;
    api
      .get("/me")
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
  }, [isAuthenticated]);
  return (
    <div className={styles.container}>
      <h1>Dashboard: {user?.email}</h1>
    </div>
  );
};

//Vamos verificar os cookies pelo lado servidor para redirecionar o user
//usando o HighOrderFunctions
export const getServerSideProps = withSSRAuth(
  async (ctx: GetServerSidePropsContext) => {
    //realiza request com setupAPiClient (que tem dentro api-axios) e todas as funções de validação e refreshToken
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/me");
    return { props: {} };
  }
);

export default Dashboard;
