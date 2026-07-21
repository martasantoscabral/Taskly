import { useEffect, useState } from "react";
import "../css/amigos.css";

function Amigos() {
  const [users, setUsers] = useState([]);
  const [seguindo, setSeguindo] = useState([]);
  const [pesquisa, setPesquisa] = useState("");
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(true);

  const BASE_API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

  const API_USERS = `${BASE_API_URL}/api/users`;

  const token = localStorage.getItem("token");

  const userGuardado = JSON.parse(
    localStorage.getItem("user"),
  );

  const meuId = userGuardado?.id_utilizador;

  async function carregarUsers() {
    try {
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
      setErro("Não foi possível comunicar com o servidor.");
      setUsers([]);
    }
  }

  async function carregarSeguindo() {
    if (!meuId) return;

    try {
      const res = await fetch(
        `${API_USERS}/${meuId}/following`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setErro(
          data.error ||
          "Não foi possível carregar os utilizadores seguidos.",
        );
        setSeguindo([]);
        return;
      }

      setSeguindo(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar pessoas seguidas:", error);
      setErro("Não foi possível comunicar com o servidor.");
      setSeguindo([]);
    }
  }

  async function carregarPagina() {
    try {
      setACarregar(true);
      setErro("");

      await Promise.all([
        carregarUsers(),
        carregarSeguindo(),
      ]);
    } finally {
      setACarregar(false);
    }
  }

  async function seguirUser(id) {
    try {
      setErro("");

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

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(
          data.error ||
          "Não foi possível seguir este utilizador.",
        );
        return;
      }

      await carregarSeguindo();
    } catch (error) {
      console.error("Erro ao seguir utilizador:", error);
      setErro("Não foi possível comunicar com o servidor.");
    }
  }

  async function deixarDeSeguir(id) {
    try {
      setErro("");

      const res = await fetch(
        `${API_USERS}/unfollow?followingId=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(
          data.error ||
          "Não foi possível deixar de seguir este utilizador.",
        );
        return;
      }

      await Promise.all([
        carregarSeguindo(),
        carregarUsers(),
      ]);
    } catch (error) {
      console.error("Erro ao deixar de seguir:", error);
      setErro("Não foi possível comunicar com o servidor.");
    }
  }

  useEffect(() => {
    carregarPagina();
  }, []);

  const idsSeguindo = seguindo.map(
    (item) => item.seguido_id,
  );

  const usersFiltrados = users.filter((user) => {
    const texto = pesquisa.trim().toLowerCase();

    const correspondePesquisa =
      (user.nome || "").toLowerCase().includes(texto) ||
      (user.handle || "").toLowerCase().includes(texto) ||
      (user.email || "").toLowerCase().includes(texto);

    const naoSouEu =
      user.id_utilizador !== meuId;

    return correspondePesquisa && naoSouEu;
  });

  return (
    <div className="amigos-page">
      <h1>Amigos</h1>

      {erro && (
        <p className="amigos-error">
          {erro}
        </p>
      )}

      {aCarregar ? (
        <p>A carregar utilizadores...</p>
      ) : (
        <>
          <section className="amigos-section">
            <h2>Pesquisar pessoas</h2>

            <input
              className="amigos-search"
              value={pesquisa}
              onChange={(e) =>
                setPesquisa(e.target.value)
              }
              placeholder="Pesquisar por nome, email ou handle..."
            />

            {pesquisa.trim() !== "" && (
              <div className="amigos-list">
                {usersFiltrados.length === 0 ? (
                  <p className="amigos-vazio">
                    Nenhum utilizador encontrado.
                  </p>
                ) : (
                  usersFiltrados.map((user) => (
                    <div
                      className="amigo-card"
                      key={user.id_utilizador}
                    >
                      <h3>{user.nome}</h3>
                      <p>@{user.handle}</p>
                      <p>{user.email}</p>

                      {idsSeguindo.includes(
                        user.id_utilizador,
                      ) ? (
                        <button
                          type="button"
                          onClick={() =>
                            deixarDeSeguir(
                              user.id_utilizador,
                            )
                          }
                        >
                          Deixar de seguir
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            seguirUser(
                              user.id_utilizador,
                            )
                          }
                        >
                          Seguir
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          <section className="amigos-section">
            <h2>Estou a seguir</h2>

            {seguindo.length === 0 ? (
              <p>Ainda não segues ninguém.</p>
            ) : (
              <div className="amigos-list">
                {seguindo.map((item) => (
                  <div
                    className="amigo-card"
                    key={
                      item.seguido
                        ?.id_utilizador ||
                      item.seguido_id
                    }
                  >
                    <h3>
                      {item.seguido?.nome ||
                        "Utilizador"}
                    </h3>

                    <p>
                      @{item.seguido?.handle || ""}
                    </p>

                    <p>
                      {item.seguido?.email || ""}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        deixarDeSeguir(
                          item.seguido
                            ?.id_utilizador ||
                            item.seguido_id,
                        )
                      }
                    >
                      Deixar de seguir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Amigos;