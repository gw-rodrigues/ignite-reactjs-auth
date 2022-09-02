import type { GetServerSidePropsContext, NextPage } from "next";
import { setupAPIClient } from "../services/api";
import styles from "../styles/Home.module.css";
import { withSSRAuth } from "../utils/withSSRAuth";
import { UserHasPermissions } from "../components/userHasPermissions";

const Metrics: NextPage = () => {
  return (
    <div className={styles.container}>
      <h1>Metrics:</h1>
      <UserHasPermissions permissions={["metrics.list"]}>
        <div>Metrics!!!!</div>
      </UserHasPermissions>
    </div>
  );
};

//Vamos verificar os cookies pelo lado servidor para redirecionar o user
//usando o HighOrderFunctions
//EXTRA-PERMISSÕES: cada página o user tem permissões diferentes - como segundo 'param2' parâmetro no withSSRAuth({param1}, {param2})
export const getServerSideProps = withSSRAuth(
  async (ctx: GetServerSidePropsContext) => {
    //realiza request com setupAPiClient (que tem dentro api-axios) e todas as funções de validação e refreshToken
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/me");
    console.log(response.data);

    return { props: {} };
  },
  //iremos fazer a jwt-decode dentro SSRAuth para obter info
  //fazemos a verificação das permissões e roles pelos server side
  {
    permissions: ["metrics.list2"],
    roles: ["administrator"],
  }
);

export default Metrics;
