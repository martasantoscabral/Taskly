import { useEffect, useState } from "react";
import "../css/amigos.css";

function Amigos() {
  const [users, setUsers] = useState([]);
  const [seguindo, setSeguindo] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [erro, setErro] = useState("");

  const API_USERS = "http://localhost:3000/api/users";
  const token = localStorage.getItem("token");

  const userGuardado = JSON.parse(localStorage.getItem("user"));
  const meuId = userGuardado?.id_utilizador;

  async function carregarUsers() {
    const res = await fetch(API_USERS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setUsers(data);
  }

  async function carregarSeguindo() {
    if (!meuId) return;

    const res = await fetch(`${API_USERS}/${meuId}/following`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setSeguindo(data);
  }

  async function seguirUser(id) {
    const res = await fetch(`${API_USERS}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        followingId: id,
      }),
    });
    carregarSeguindo();
  }

    
  async function deixarDeSeguir(id) {
    const res = await fetch(`${API_USERS}/unfollow?followingId=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await carregarSeguindo();
    await carregarUsers();
  }

  useEffect(() => {
    carregarUsers();
    carregarSeguindo();
  }, []);



  const idsSeguindo = seguindo.map((item) => item.seguido_id);
  const usersFiltrados = users.filter((user) => {
    const texto = pesquisa.toLowerCase();

    const correspondePesquisa =
      user.nome.toLowerCase().includes(texto) ||
      user.handle.toLowerCase().includes(texto) ||
      user.email.toLowerCase().includes(texto);

    const naoSouEu = user.id_utilizador !== meuId;
    return correspondePesquisa && naoSouEu;
  });




  //pagina web
  return (
    <div className="amigos-page">
      <h1>Amigos</h1>
      {erro && <p className="amigos-error">{erro}</p>}
      
{/* pesquisar */}
      <section className="amigos-section">
        <h2>Pesquisar pessoas</h2>

        <input
          className="amigos-search"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder="Pesquisar por nome, email ou handle..."
        />

        {pesquisa.trim() !== "" && (
          <div className="amigos-list">
            {usersFiltrados.map((user) => (
              <div className="amigo-card" key={user.id_utilizador}>
                <h3>{user.nome}</h3>
                <p>@{user.handle}</p>
                <p>{user.email}</p>

                {idsSeguindo.includes(user.id_utilizador) ? (
                  <button onClick={() => deixarDeSeguir(user.id_utilizador)}> Deixar de seguir</button>
                ) : (
                  <button onClick={() => seguirUser(user.id_utilizador)}> Seguir </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>




{/* amigos */}
      <section className="amigos-section">
        <h2>Estou a seguir</h2>

        {seguindo.length === 0 ? (
          <p>Ainda não segues ninguém.</p>
        ) : (
          <div className="amigos-list">
            {seguindo.map((item) => (
              <div className="amigo-card" key={item.seguido.id_utilizador}>
                <h3>{item.seguido.nome}</h3>
                <p>@{item.seguido.handle}</p>
                <p>{item.seguido.email}</p>

                <button onClick={() => deixarDeSeguir(item.seguido.id_utilizador)}>Deixar de seguir</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Amigos;