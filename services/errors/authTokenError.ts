//vamos exportar a class AuthTokenError que extends Error(class errors genérico do javascript)
//Porque criamos um class de error? para pode diferenciar um erro do outro, além do genéricos
export class AuthTokenError extends Error {
  //constructor quando for estanciar um novo objeto da class
  constructor() {
    //chamar a class pai - class Error - super()
    //recebe uma mensagem como parâmetro
    super("Error with Authentication token.");
  }
}
