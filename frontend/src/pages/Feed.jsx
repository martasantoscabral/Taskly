import { useEffect, useState } from "react";
import "../css/feed.css";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [erro, setErro] = useState("");

  // MODAL
  const [mostrarModal, setMostrarModal] = useState(false);

  // NOVA PUBLICAÇÃO
  const [novaPublicacao, setNovaPublicacao] = useState("");
  const [tipoPublicacao, setTipoPublicacao] = useState("POST");

  // ASSOCIAÇÕES
  const [tarefas, setTarefas] = useState([]);
  const [subtarefas, setSubtarefas] = useState([]);
  const [desafios, setDesafios] = useState([]);
  const [associacao, setAssociacao] = useState("");

  const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const API_FEED = `${BASE_API_URL}/api/feed`;
  const API_TASKS = `${BASE_API_URL}/api/tasks`;
  const API_CHALLENGES = `${BASE_API_URL}/api/challenges`;

  const token = localStorage.getItem("token");

  const userGuardado = JSON.parse(localStorage.getItem("user"));
  const meuId = userGuardado?.id_utilizador;

  // CARREGAR FEED
  async function carregarFeed() {
    try {
      setErro("");

      const res = await fetch(API_FEED, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Não foi possível carregar o feed.");
        setPosts([]);
        return;
      }

      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar feed:", error);
      setErro("Não foi possível comunicar com o servidor.");
      setPosts([]);
    }
  }

  // CARREGAR TAREFAS / SUBTASKS / DESAFIOS
  async function carregarAssociacoes() {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {

      // TAREFAS
      const resTarefas = await fetch(
        `${API_TASKS}?id_user=${meuId}`,
        { headers }
      );

      if (resTarefas.ok) {
        const data = await resTarefas.json();
        setTarefas(data);
      }

      // DESAFIOS
      const resDesafios = await fetch(
        API_CHALLENGES,
        { headers }
      );

      if (resDesafios.ok) {
        const data = await resDesafios.json();
        setDesafios(data);
      }

    } catch (err) {
      console.log(err);
    }
  }

  // CRIAR PUBLICAÇÃO
  async function criarPublicacao() {
    if (!novaPublicacao.trim()) {
      setErro("Escreve alguma coisa.");
      return;
    }

    const body = {
      id_user: Number(meuId),
      comentario: novaPublicacao,
      tipo:
        tipoPublicacao === "TAREFA"
          ? "TAREFA_EM_PROGRESSO"
          : "DESAFIO_CONCLUIDO",
    };

    if (associacao) {
      const [tipoAssociacao, id] = associacao.split(":");

      if (tipoAssociacao === "tarefa") {
        body.id_tarefa = Number(id);
      }

      if (tipoAssociacao === "subtarefa") {
        body.id_subtask = Number(id);
        body.tipo = "SUBTAREFA_CONCLUIDA";
      }

      if (tipoAssociacao === "desafio") {
        body.id_desafio = Number(id);
        body.tipo = "DESAFIO_CONCLUIDO";
      }
    }

    console.log("A enviar publicação:", body);

    const res = await fetch(API_FEED, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setErro(data.error || "Não foi possível criar a publicação.");
      return;
    }

    setNovaPublicacao("");
    setTipoPublicacao("TAREFA");
    setAssociacao("");
    setMostrarModal(false);
    setErro("");
    carregarFeed();
  }


  // LIKE
  async function darLike(idPublicacao) {
    await fetch(`${API_FEED}/${idPublicacao}/like`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        id_user: meuId,
      }),
    });

    carregarFeed();
  }

  async function tirarLike(idPublicacao) {
    await fetch(`${API_FEED}/${idPublicacao}/like`, {
      method: "DELETE",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id_user: meuId,
      }),
    });

    carregarFeed();
  }

  // COMENTAR
  async function comentar(idPublicacao) {
    const texto = comentarios[idPublicacao];

    if (!texto || !texto.trim()) return;

    await fetch(`${API_FEED}/${idPublicacao}/comments`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        id_user: meuId,
        comentario: texto,
      }),
    });

    setComentarios({
      ...comentarios,
      [idPublicacao]: "",
    });

    carregarFeed();
  }

  // USE EFFECT
  useEffect(() => {
    carregarFeed();
    carregarAssociacoes();
  }, []);

  return (
    <div className="feed-page">

      {/* TOPO */}
      <div className="feed-top">
        <h1>Feed</h1>
        <button className="btn-criar-publicacao" onClick={() => setMostrarModal(true)}>+ Criar publicação</button>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-publicacao">
            <div className="modal-header">
              <h2>Nova publicação</h2>
              <button className="modal-close" onClick={() => setMostrarModal(false)}>×</button>
            </div>
            <label>O que queres partilhar?</label>

            <textarea value={novaPublicacao} onChange={(e) => setNovaPublicacao(e.target.value)} placeholder="Escreve aqui..."/>

            {/* TIPOS */}
            <label>Tipo de publicação</label>
            <div className="tipo-publicacao-lista">

              {/* TAREFA */}
              <button type="button" className={tipoPublicacao === "TAREFA"? "tipo-ativo": ""}
                onClick={() => {
                  setTipoPublicacao("TAREFA");
                  setAssociacao("");
                }}
              >Tarefa</button>

              {/* DESAFIO */}
              <button type="button" className={tipoPublicacao === "DESAFIO" ? "tipo-ativo" : ""}
                onClick={() => {
                  setTipoPublicacao("DESAFIO");
                  setAssociacao("");
                }}
              >Desafio</button>
            </div>


            {/* ASSOCIAR */}
            {(tipoPublicacao === "TAREFA" ||
              tipoPublicacao === "DESAFIO") && (
              <>
                <label>Associar</label>
                <select value={associacao} onChange={(e) => setAssociacao(e.target.value)}>
                  <option value="">Nenhum</option>

                  {/* TAREFAS */}
                  {tipoPublicacao === "TAREFA" &&
                    tarefas.map((tarefa) => (
                      <option key={`tarefa-${tarefa.id}`} value={`tarefa:${tarefa.id}`}>
                        Tarefa - {tarefa.title}
                      </option>
                    ))}


                  {/* SUBTASKS */}
                  {tipoPublicacao === "TAREFA" &&
                    subtarefas.map((subtask) => (
                      <option key={`subtarefa-${subtask.id_subtask}`} value={`subtarefa:${subtask.id_subtask}`}>Subtarefa - {subtask.titulo} </option>
                    ))}

                  {/* DESAFIOS */}
                  {tipoPublicacao === "DESAFIO" &&
                    desafios.map((desafio) => (
                      <option key={`desafio-${desafio.id_desafio}`} value={`desafio:${desafio.id_desafio}`}
                      >Desafio - {desafio.titulo}</option>
                    ))}

                </select>
              </>
            )}

            {/* FOOTER */}
            <div className="modal-footer">
              <button className="btn-cancelar"  onClick={() => setMostrarModal(false)}>Cancelar</button>
              <button type="button" className="btn-publicar" onClick={criarPublicacao}>Publicar</button>
            </div>
          </div>
        </div>
      )}

      {/* FEED */}
      {posts.length === 0 ? (
        <p>Ainda não existem publicações.</p>
      ) : (
        <div className="feed-list">
          {posts.map((post) => {
            const jaGostei = post.likes?.some(
              (like) => like.id_user === meuId
            );

            return (
              <div className="feed-card" key={post.id_publicacao}>
                
                {/* HEADER */}
                <div className="feed-header">
                  <div>
                    <h3>{post.utilizador?.nome}</h3>
                    <p>@{post.utilizador?.handle}</p>
                  </div>
                </div>

                {/* TEXTO */}
                <p className="feed-comentario"> {post.comentario}</p>

                {/* TAREFA */}
                {post.tarefa && (
                  <div className="feed-extra">
                    <strong>Tarefa:</strong>
                    <p>{post.tarefa.title}</p>
                  </div>
                )}

                {/* SUBTASK */}
                {post.subtask && (
                  <div className="feed-extra">
                    <strong>Subtarefa:</strong>
                    <p>{post.subtask.titulo}</p>
                  </div>
                )}

                {/* DESAFIO */}
                {post.desafio && (
                  <div className="feed-extra">
                    <strong>Desafio:</strong>
                    <p>{post.desafio.titulo}</p>
                  </div>
                )}

                {/* LIKES */}
                <div className="feed-actions">
                  {jaGostei ? (
                    <button onClick={() => tirarLike(post.id_publicacao)}>Remover like</button>
                  ) : (
                    <button onClick={() => darLike(post.id_publicacao)}>Like</button>
                  )}

                  <span>
                    {post.likes?.length || 0} likes
                  </span>
                </div>

                {/* COMENTÁRIOS */}
                <div className="feed-comments">
                  <h4>Comentários</h4>
                  {post.comentarios?.map((comentario) => (
                    <div className="feed-comment" key={comentario.id_comentario}>
                      <strong>{comentario.utilizador?.nome}:</strong>{" "}{comentario.comentario}
                    </div>
                  ))}

                  <div className="feed-comment-form">
                    <input value={comentarios[post.id_publicacao] || ""}
                      onChange={(e) =>
                        setComentarios({
                          ...comentarios,
                          [post.id_publicacao]:
                            e.target.value,
                        })
                      }
                      placeholder="Escrever comentário..."
                    />

                    <button onClick={() => comentar(post.id_publicacao)}>Comentar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Feed;