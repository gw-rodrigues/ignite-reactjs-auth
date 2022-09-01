import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";

//<P> é uma tipagem, que foi definida anteriormente na função original e esta sendo passada para as outras funções

//Vamos usar uma HighOrderFunction recebe uma função e retorna uma função
export function withSSRGuest<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  //definimos que withSSRGuest recebe tipo <P> definido na função original que chamou - retornará uma ": GetServerSideProps"
  //recebemos uma função na var "fn" tipo GetServerSideProps que recebe tipo <P> definido na função original que chamou

  //retornamos uma função tipo Promise<GetServerSidePropsResult<P>> que recebe <P> da função original que chamou
  //que tem param "ctx" tipo GetServerSidePropsContext
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
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

    //caso nao existir o cookie retornamos a função original/recebemos como parâmetro
    return await fn(ctx);
  };
}
