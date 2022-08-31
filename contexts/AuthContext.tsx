import Router from "next/router";
import { createContext, ReactNode, useState } from "react";
import { api } from "../services/api";

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user; // !!user == undefined = false, se nao true

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

      setUser({ email, permissions, roles }); //salvar as informações do usuário

      Router.push("/dashboard"); //redirecionar user para uma página, também há o {useRouter} - faz mesmo
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
