import { useEffect, useState } from "react";
import "../css/users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(true);

  const BASE_API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

  const API_USERS = `${BASE_API_URL}/api/users`;

  const token = localStorage.getItem("token");

  async function carregarUsers() {
    try {
      setACarregar(true);
      setErro("");

      const res = await fetch(API_USERS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(
          data.error ||
          "Não foi possível carregar os utilizadores.",
        );
        setUsers([]);
        return;
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar utilizadores:", error);

      setErro(
        "Não foi possível comunicar com o servidor.",
      );

      setUsers([]);
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarUsers();
  }, []);

  return (
    <div className="users-page">
      <h1>Users</h1>

      {erro && (
        <p className="users-error">
          {erro}
        </p>
      )}

      {aCarregar ? (
        <p>A carregar utilizadores...</p>
      ) : users.length === 0 ? (
        <p>Não existem utilizadores.</p>
      ) : (
        <div className="users-list">
          {users.map((user) => (
            <div
              key={user.id_utilizador}
              className="user-card"
            >
              <h3>{user.nome}</h3>

              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                <strong>Handle:</strong> @{user.handle}
              </p>

              <p>
                <strong>Role:</strong> {user.role}
              </p>

              <p>
                <strong>Suspenso:</strong>{" "}
                {user.suspenso ? "Sim" : "Não"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;