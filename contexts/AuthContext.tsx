import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { api } from "../services/apiClient";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>; //vai receber as credenciais do usuário
  signOut: () => void; //vai desligar user
  isAuthenticated: boolean;
  user: User | undefined;
};

type AuthProviderProps = {
  children: ReactNode; //ReactNode tipagem quando componente pode receber qualquer outra coisa nele, componentes, textos, números, etc...
};

export const AuthContext = createContext({} as AuthContextData); //Cria o context com as tipagens

//BroadcastChannel - Inicializando apenas com tipagem, pois nao pode ser iniciado no server!
let authChannel: BroadcastChannel;

export function signOut() {
  //#############################################################################
  //COMO VAMOS DESLIGAR OS USERS EM TODAS JANELAS/ABAS ABERTAS???
  //
  //---> BroadcastChannel *** ATENÇÃO - só é executado no lado cliente, no lado servidor nao existe!
  //
  // A interface BroadcastChannel (canal de transmissão) representa um canal com um nome em que qualquer browsing context (en-US)
  // (contexto de navegação) de uma determinada origin (origem) pode assinar. Permite a comunicação entre diferentes documentos
  // (em diferentes janelas, abas, frames ou iframes) da mesma origin. As mensagens são transmitidas através de um evento message
  // acionado em todos objetos do tipo BroadcastChannel que estão ouvindo o canal.
  //
  // WEBSITE: https://developer.mozilla.org/pt-BR/docs/Web/API/BroadcastChannel
  // DOCS: https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel/BroadcastChannel
  //#############################################################################

  //se acontecer um erro que nao foi de refreshToken, se user deletado, nos cookies token invalido etc, desligar o user
  //iremos apagar os cookies e redirecionar para home
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");

  //como BroadcastChannel - para enviar um mensagem - para depois poder ouvir a mensagem no browser
  authChannel.postMessage("signOut");

  //PORQUE O RELOAD??? Router.push('/...') está dar erro, nao carregas informações do user ou nao redireciona procriadamente
  //Router.push("/"); //so funciona lado browser, e pelo server nao
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user; // !!user == undefined = false, se nao true

  useEffect(() => {
    //como useEffect executa no lado cliente, então com a tipagem definimos um valor para o authChannel como BroadcastChannel
    authChannel = new BroadcastChannel("auth");
    authChannel.onmessage = (message) => {
      console.log(message.data);

      //DEVEMOS SEMPRE FECHAR O ENVIO DE MENSAGEM DO authChannel, se nao faz loop infinito
      if (message.data === "signOut" || message.data === "signIn") {
        Router.reload(); //PORQUE O RELOAD??? Router.push('/...') está dar erro, nao carregas informações do user ou nao redireciona procriadamente
      } //caso evento mensagem recebida for signOut, vamos desligar o user de todas as páginas
      //caso evento mensagem recebida for signIn, vamos redirecionar o user em todas as páginas para Dashboard
    };
  }, []);

  //sempre que carregar a app iremos buscar as informações, permissions, roles, etc no back-end, nao iremos guardar no localStorage
  useEffect(() => {
    const { "nextauth.token": token } = parseCookies(); //nookies obtém todos os cookies criados no storage, nesse caso coloca {nextauth.token} na var token
    if (token) {
      //fazer o pedido das informações do usuário (AuthToken está automaticamente adicionado em todas requisições na api)
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({ email, permissions, roles }); //atualizamos info do user
        })
        .catch(() => {
          //precisar saber se é undefined para nao rodar lado servidor
          if (typeof window !== "undefined") {
            signOut();
          }
        });
    }
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data; //receber permissões, roles da server api

      //sessionStorage - ao sai da aplicação é apagado, nao existe mais
      //localStorage - so existe cliente side, nao existe no servidor e nem pode ser acessado pelo servidor
      //cookies - armazenar cliente e pode ser acessado no cliente e no servidor (vamos user este!)

      //1 param: undefined = sempre tratar pelo lado do browser, add, rem, etc, tem que ser undefined
      //2 param: nome do cookie, ex: nextauth.token
      //3 param: valor do cookie, ex: token
      //4 param: {} informações adicionais do cookie
      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, //30 dias - responsabilidade do back-end verificar expiração do token e realizar acoes necessárias
        path: "/", //qual rota "/" em todas as rotas ou "/dashboard" apenas nessa rota, etc.
      });
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({ email, permissions, roles }); //salvar as informações do usuário

      //precisamos adicionar o token ao headers, antes de redirecionar user, se nao sempre irá fazer uma requisição com Authorization undefined para o back-end
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      //Router.push("/dashboard");
      //PORQUE O RELOAD??? Router.push('/...') está dar erro, nao carregas informações do user ou nao redireciona procriadamente
      //redirecionar user para uma página, também há o {useRouter} - faz mesmo
      //Router so funciona no client, então para funcionar no server temos fazer return com redirect dentro
      //iremos no api, realizar um erro (object error), que ira retornar para o SSR

      //Vamos enviar mensagem de broadcastChannel para o browser, para todas janelas e abas
      authChannel.postMessage("signIn");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
