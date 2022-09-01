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
  signIn(credentials: SignInCredentials): Promise<void>; //vai receber as credenciais do usuário
  isAuthenticated: boolean;
  user: User | undefined;
};

type AuthProviderProps = {
  children: ReactNode; //ReactNode tipagem quando componente pode receber qualquer outra coisa nele, componentes, textos, números, etc...
};

export const AuthContext = createContext({} as AuthContextData); //Cria o context com as tipagens

export function signOut() {
  //se acontecer um erro que nao foi de refreshToken, se user deletado, nos cookies token invalido etc, desligar o user
  //iremos apagar os cookies e redirecionar para home
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");
  Router.push("/"); //so funciona lado browser, e pelo server nao
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user; // !!user == undefined = false, se nao true

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

      Router.push("/dashboard "); //redirecionar user para uma página, também há o {useRouter} - faz mesmo
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
