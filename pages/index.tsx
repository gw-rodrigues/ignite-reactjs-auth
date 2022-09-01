import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from "next";
import { parseCookies } from "nookies";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext); //Iniciar o contexto para obter as informações

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const data = { email, password };
    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
};

//com cookies podem ter acesso aos cookies pelos dois ambientes, client and server
//há nao ser se for HTTPOnly cookies então é somente pelo server.

//Vamos verificar os cookies pelo lado servidor para redirecionar o user
export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  //Com parse cookies podemos obter os cookies, em array, temos que usar var: ctx, outras como req ou req.cookies, ctx.req.cookies nao funcionam no parse
  const cookies = parseCookies(ctx);

  //verificamos se existe, e vamos redirecionar para o /dashboard
  if (cookies["nextauth.token"]) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false, //falar se vai sempre acontecer o redirecionamento ou só dessa ver por uma condição
      },
    };
  }
  return { props: {} };
};

export default Home;
