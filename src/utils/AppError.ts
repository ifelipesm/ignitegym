export class AppError {
  message: string;

  //constructor -> É a estrutura da instancia de classe criada
  constructor(message: string){ //Todo app error deve receber uma message
    this.message = message; 
  }
}