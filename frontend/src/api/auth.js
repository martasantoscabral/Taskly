//função que envia o email e a password para o servidor (backend) para fazer login. 
//faz um pedido HTTP POST, recebe a resposta -> devolve os dados do utilizador (como token e informação do user). 
//onde está o servidor (Express)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await lerResposta(response);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.errors?.join(", ") ||
        data.message ||
        "Erro ao iniciar sessão",
    );
  }

  return data;
}

export async function register(nome, email, handle, password) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nome,
      email,
      handle,
      password,
    }),
  });

  const data = await lerResposta(response);

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.errors?.join(", ") ||
        data.message ||
        "Erro ao criar conta",
    );
  }

  return data;
}

async function lerResposta(response) {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  const texto = await response.text();

  return {
    error:
      texto || `O servidor respondeu com o estado ${response.status}`,
  };
}