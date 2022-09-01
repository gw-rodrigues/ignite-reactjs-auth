import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";

let cookies = parseCookies();
let isRefreshing = false; //verifica se estamos a atualizar o token

type FailedRequestsQueueProps = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

let failedRequestsQueue: FailedRequestsQueueProps[] = []; //contém todas as requisições que deram falha. Para realizar depois atualizar o refreshtoken

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    //no header iremos buscar/receber todas informações, permissions e roles do user
    Authorization: `Bearer ${cookies["nextauth.token"]}`, //add header default,"Bearer" (um formato padrão) para enviar sempre um token de auth para back-end, para verificação do user
  },
});

//api.interceptors - {.resquest (frontend ao enviar) ou .response (backend do receber)} interceptar todas as requisições e executa um código antes da requisição
//vamos usar para fazer refresh do token do user.
//1 param -  se der 'success' - nao fazer nada
//2 para - o que fazer se der error

interface AxiosErrorProps {
  code?: string;
}

api.interceptors.response.use(
  (response) => {
    //success - nao fazer nada
    return response;
  },
  (error: AxiosError<AxiosErrorProps>) => {
    //error - executar este código, error tipagem any, assim usamos AxiosError tem todas as tipagens deste error.
    console.log(error.response?.status, error.response?.data.code);
    if (error.response?.status === 401) {
      if (error.response?.data.code === "token.expired") {
        //renovar token
        cookies = parseCookies();
        //obter o refreshToken dos cookies
        const { "nextauth.refreshToken": refreshToken } = cookies;
        const originalConfig = error.config; //todas as configurações que foi feito para backend, todas informações precisas para repetir para backend, rotas chamei, quais parâmetros enviados, qual callback apos a requisição, todas informações necessárias

        if (!isRefreshing) {
          isRefreshing = true; //coloca true para parar todas as requisições com token antigo

          //fazer pedido para backend para obter o novo token na response e salvar nos cookies
          api
            .post("/refresh", {
              refreshToken,
            })
            .then((response) => {
              const { token, refreshToken: newRefreshToken } = response.data;

              setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30, //30 dias - responsabilidade do back-end verificar expiração do token e realizar acoes necessárias
                path: "/",
              });

              setCookie(undefined, "nextauth.refreshToken", newRefreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
              });

              api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

              //caso token atualizado com sucesso, vamos fazer todas as requisições novamente com token atualizado
              failedRequestsQueue.forEach((request) =>
                request.onSuccess(token)
              );
              failedRequestsQueue = []; //limpar a lista de requisições em queue
            })
            .catch((error) => {
              failedRequestsQueue.forEach(
                (request) => request.onFailure(error) //caso for error, fazemos onFailure e passamos o error
              );
              failedRequestsQueue = [];
              if (typeof window !== "undefined") {
                signOut();
              }
            })
            .finally(() => (isRefreshing = false));
        }

        //temos que criar uma Promise function porque o Axios nao aceita "async" no interruptores das requisições
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              if (!originalConfig?.headers) {
                return; //Eu coloquei um return mas pode colocar algum erro ou um reject
              }
              //caso nao e verificado acima da um erro quando originalConfig nao tem headers
              originalConfig.headers["Authorization"] = `Bearer ${token}`; //alterar no headers o token antigo para novo

              resolve(api(originalConfig));
            }, //que vai acontecer após o token for atualizado/finalizado
            onFailure: (error: AxiosError) => {
              reject(error);
            }, //o que vai acontecer com aquela requisição caso refreshToken dar errado
          });
        });
      } else {
        //iremos tratar aqui qualquer erro 401 que nao foi indicado acima ex: token, iremos desligar o user
        //importaremos a função signOut do AuthContext
        //fazemos verificação se tipo window esta ser executado no browser com javascript ativado
        if (typeof window !== "undefined") {
          signOut();
        }
      }
    }
    //importante que no final todos if do interceptor, se nao cair em nenhum if, então deixamos error do Axios continuar a acontecer*
    return Promise.reject(error);
  }
);
