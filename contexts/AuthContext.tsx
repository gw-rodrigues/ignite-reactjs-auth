import { createContext, ReactNode } from "react";

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>; //vai receber as credenciais do usuário
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode; //ReactNode tipagem quando componente pode receber qualquer outra coisa nele, componentes, textos, números, etc...
};

export const AuthContext = createContext({} as AuthContextData); //Cria o context com as tipagens

export function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = false;

  async function signIn({ email, password }: SignInCredentials) {
    console.log({ email, password });
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
