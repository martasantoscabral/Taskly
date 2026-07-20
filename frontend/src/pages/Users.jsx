import { useEffect, useState } from "react";
import "../css/users.css";

function Users() {
  // Guarda todos os users vindos da API
  const [users, setUsers] = useState([]);
  // Guarda mensagens de erro
  const [erro, setErro] = useState("");
  const API_URL = "http://localhost:3000/api/users";
  const token = localStorage.getItem("token");


  /**
   * Carrega os users da API
   */
  async function carregarUsers() {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // DAdos recebidos
    const data = await res.json();
    // Guarda users no state
    setUsers(data);
  }

  // Executa quando a página abre
  useEffect(() => {
    carregarUsers();
  }, []);



  //pagina web
  return (
    <div className="users-page">
      <h1>Users</h1>

      {/* Mensagem de erro */}
      {erro && <p className="users-error">{erro}</p>}

      {/* Sem users */}
      {users.length === 0 ? (
        <p>Não existem utilizadores.</p>
      ) : (
        <div className="users-list">
          {users.map((user) => (
            <div key={user.id_utilizador} className="user-card">

              <h3>{user.nome}</h3>

              <p>Email:{user.email}</p>
              <p>Handle:@{user.handle}</p>
              <p>Role:{user.role}</p>
              <p>Suspenso:{user.suspenso ? "Sim" : "Não"}</p>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;