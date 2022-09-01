import type { GetServerSidePropsContext, NextPage } from "next";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Home.module.css";
import { withSSRGuest } from "../utils/withSSRGuest";

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
//Programação funcional = como usamos .map, .reduce, .filter, .every, .some
//Vamos utilizar método HighOrderFunction para enviar uma função para o utils/withSSRGuest, que irá verificar o user e irá retorna uma função *GetServerSideProps
//<P> == ...= withSSRGuest<{ users: string[]; }>(...)... é o tipo de retorno, que será passado entre/para as outras funções que iram ser chamadas e terá haver retorno desse tipo dentro "props: {users: [...]}"
//<P> == ...= withSSRGuest(...)... caso removemos tipagem, podemos retornar qualquer tipo de retorno
export const getServerSideProps = withSSRGuest(
  async (ctx: GetServerSidePropsContext) => {
    return { props: {} };
  }
);

export default Home;
