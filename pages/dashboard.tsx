import type { GetServerSidePropsContext, NextPage } from "next";
import { useContext, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import styles from "../styles/Home.module.css";
import { withSSRAuth } from "../utils/withSSRAuth";
import { UserHasPermissions } from "../components/userHasPermissions";

const Dashboard: NextPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);

  //   //vamos fazer verificar de permissões usando o hook/usePermissions (return true  or false)
  //   const userCanSeeMetrics = UserPermissions({
  //     permissions: ["metrics.list"], //se tiver essa permissions
  //     roles: ["administrator", "editor"], //se tiver 1 das roles com permissão
  //   });
  //   //Estamos a validar no frontend, nao tem segurança nenhuma, tem der ser feito no backend /também

  useEffect(() => {
    if (isAuthenticated) return;
    // api
    //   .get("/me")
    //   .then((response) => console.log(response.data))
    //   .catch((error) => console.log(error));
  }, [isAuthenticated]);
  return (
    <div className={styles.container}>
      <h1>Dashboard: {user?.email}</h1>
      <UserHasPermissions permissions={["metrics.list"]}>
        <div>Metrics!!!!</div>
      </UserHasPermissions>
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
    //console.log(response.data);

    return { props: {} };
  }
);

export default Dashboard;
