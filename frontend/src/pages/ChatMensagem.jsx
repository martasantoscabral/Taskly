import { useEffect, useRef, useState } from "react";
import "../css/ChatMensagem.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

function ChatMensagem({
  grupoSelecionado,
  meuId,
  token,
  voltarGrupo,
}) {
  const [novaMensagem, setNovaMensagem] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [aCarregar, setACarregar] = useState(true);
  const [aEnviar, setAEnviar] = useState(false);
  const [erro, setErro] = useState("");

  const fimChatRef = useRef(null);

  const grupoId = grupoSelecionado?.grupo_id;

  async function lerResposta(res) {
    const tipo = res.headers.get("content-type");

    if (tipo?.includes("application/json")) {
      return res.json();
    }

    return {
      error: await res.text(),
    };
  }

  async function carregarMensagens() {
    if (!grupoId || !token) return;

    try {
      setACarregar(true);
      setErro("");

      const res = await fetch(
        `${API_URL}/api/chat/group/${grupoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await lerResposta(res);

      if (!res.ok) {
        setErro(
          data.error || "Erro ao carregar mensagens.",
        );
        setMensagens([]);
        return;
      }

      setMensagens(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar chat:", error);
      setErro("Não foi possível comunicar com o servidor.");
    } finally {
      setACarregar(false);
    }
  }

  async function enviarMensagem() {
    const texto = novaMensagem.trim();

    if (!texto || aEnviar || !grupoId) return;

    try {
      setAEnviar(true);
      setErro("");

      const res = await fetch(
        `${API_URL}/api/chat/group/${grupoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            texto,
          }),
        },
      );

      const data = await lerResposta(res);

      if (!res.ok) {
        setErro(
          data.error || "Erro ao enviar mensagem.",
        );
        return;
      }

      setMensagens((anteriores) => [
        ...anteriores,
        data,
      ]);

      setNovaMensagem("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setErro("Não foi possível comunicar com o servidor.");
    } finally {
      setAEnviar(false);
    }
  }

  useEffect(() => {
    carregarMensagens();
  }, [grupoId, token]);

  useEffect(() => {
    fimChatRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [mensagens]);

  return (
    <div className="pagina-chat-mensagens">
      <header className="topo-chat-grupo">
        <button
          type="button"
          className="botao-voltar-chat"
          onClick={voltarGrupo}
        >
          ← Voltar
        </button>

        <div className="titulo-chat-grupo">
          <h2>{grupoSelecionado?.nome}</h2>
          <p>
            Chat do grupo
            {!aCarregar &&
              ` · ${mensagens.length} mensagem(ns)`}
          </p>
        </div>
      </header>

      {erro && (
        <p className="chat-erro">
          {erro}
        </p>
      )}

      <main className="chat-box-grande">
        {aCarregar ? (
          <div className="estado-chat">
            <span className="loader-chat" />
            <p>A carregar mensagens...</p>
          </div>
        ) : mensagens.length === 0 ? (
          <div className="estado-chat">
            <div className="icone-chat-vazio">💬</div>
            <h3>Ainda não existem mensagens</h3>
            <p>
              Envia a primeira mensagem deste grupo.
            </p>
          </div>
        ) : (
          mensagens.map((mensagem) => {
            const minhaMensagem =
              mensagem.user_id === meuId ||
              mensagem.id_user === meuId;

            return (
              <article
                key={mensagem.id_mensagem}
                className={`mensagem-chat ${
                  minhaMensagem
                    ? "mensagem-chat-minha"
                    : ""
                }`}
              >
                <div className="mensagem-chat-cabecalho">
                  <strong>
                    {minhaMensagem
                      ? "Eu"
                      : mensagem.utilizador?.nome ||
                        "Utilizador"}
                  </strong>

                  {mensagem.criadaEm && (
                    <time>
                      {new Date(
                        mensagem.criadaEm,
                      ).toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  )}
                </div>

                <p>{mensagem.texto}</p>
              </article>
            );
          })
        )}

        <div ref={fimChatRef} />
      </main>

      <footer className="enviar-chat-box">
        <input
          type="text"
          placeholder="Escrever mensagem..."
          value={novaMensagem}
          maxLength={2000}
          disabled={aEnviar || aCarregar}
          onChange={(e) =>
            setNovaMensagem(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {
              e.preventDefault();
              enviarMensagem();
            }
          }}
        />

        <button
          type="button"
          onClick={enviarMensagem}
          disabled={
            aEnviar ||
            aCarregar ||
            !novaMensagem.trim()
          }
        >
          {aEnviar ? "A enviar..." : "Enviar"}
        </button>
      </footer>
    </div>
  );
}

export default ChatMensagem;