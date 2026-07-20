//função que envia o email e a password para o servidor (backend) para fazer login. 
//faz um pedido HTTP POST, recebe a resposta -> devolve os dados do utilizador (como token e informação do user). 
//onde está o servidor (Express)
const API = "http://localhost:3000";


//Função para fazer login
export async function login(email, password) {
  //Faz um pedido HTTP para o backend -> rota de login
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    //Converte o objeto JS -> JSON 
    body: JSON.stringify({ email, password }),
  });
  //Converte a resposta do servidor (JSON) para objeto JS
  return await res.json();
}