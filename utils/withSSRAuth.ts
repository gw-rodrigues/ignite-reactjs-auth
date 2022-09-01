import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/authTokenError";

//<P> é uma tipagem, que foi definida anteriormente na função original e esta sendo passada para as outras funções

//Vamos usar uma HighOrderFunction recebe uma função e retorna uma função
export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  //definimos que withSSRGuest recebe tipo <P> definido na função original que chamou - retornará uma ": GetServerSideProps"
  //recebemos uma função na var "fn" tipo GetServerSideProps que recebe tipo <P> definido na função original que chamou

  //retornamos uma função tipo Promise<GetServerSidePropsResult<P>> que recebe <P> da função original que chamou
  //que tem param "ctx" tipo GetServerSidePropsContext
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    //Com parse cookies podemos obter os cookies, em array, temos que usar var: ctx, outras como req ou req.cookies, ctx.req.cookies nao funcionam no parse
    const cookies = parseCookies(ctx);

    //verificamos se "NAO" existe token, e vamos redirecionar para o / - home - login
    if (!cookies["nextauth.token"]) {
      return {
        redirect: {
          destination: "/",
          permanent: false, //falar se vai sempre acontecer o redirecionamento ou só dessa ver por uma condição
        },
      };
    }

    //para nao ficarmos a repetir o código todas vez/todas páginas que der um error de authTokenError
    //assim recebemos a função original e caso de error de auth do token, obtemos o error, eliminamos cookies e redirecionamos o user
    try {
      //caso nao existir o cookie retornamos a função original/recebemos como parâmetro
      return await fn(ctx);
    } catch (error) {
      //só redirecionamos o user caso for AuthTokenError
      if (error instanceof AuthTokenError) {
        //caso servidor for reiniciado e der o error authTokenError
        //capturamos o error e eliminados os cookies do user através do server - se nao forem eliminados ficaria a fazer redirect da home,login para/de volta para o dashboard
        //redirecionamos os users através do server para página home, login, etc
        destroyCookie(ctx, "nextauth.token");
        destroyCookie(ctx, "nextauth.refreshToken");
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }

      //caso for error padrão, então vamos redirecionar o user para página padrão de errors
      return {
        redirect: {
          destination: "/error", // Em caso de um erro não esperado, você pode redirecionar para uma página publica de erro genérico
          permanent: false,
        },
      };
    }
  };
}
