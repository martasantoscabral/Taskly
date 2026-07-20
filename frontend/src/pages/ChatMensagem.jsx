import { useState } from "react";
import "../css/ChatMensagem.css";

function ChatMensagem({ grupoSelecionado, meuId, voltarGrupo }) {
  const [novaMensagem, setNovaMensagem] = useState("");

  const [mensagens, setMensagens] = useState([
    {
      id_mensagem: 1,
      id_user: 1,
      utilizador: { nome: "Ana Admin" },
      texto: "Bem-vindos ao chat do grupo!",
    },
    {
      id_mensagem: 2,
      id_user: meuId,
      utilizador: { nome: "Eu" },
      texto: "Ok, vou tratar da minha tarefa.",
    },
  ]);

  function enviarMensagem() {
    if (!novaMensagem.trim()) return;

    const nova = {
      id_mensagem: Date.now(),
      id_user: meuId,
      utilizador: { nome: "Eu" },
      texto: novaMensagem,
    };

    setMensagens([...mensagens, nova]);
    setNovaMensagem("");
  }

  return (
    <div className="pagina-chat-mensagens">
      <header className="topo-chat-grupo">
        <button onClick={voltarGrupo}>← Voltar</button>

        <div>
          <h2>{grupoSelecionado.nome}</h2>
          <p>Chat do grupo</p>
        </div>
      </header>

      <div className="chat-box-grande">
        {mensagens.length === 0 ? (
          <p className="sem-mensagens">Ainda não existem mensagens.</p>
        ) : (
          mensagens.map((mensagem) => (
            <div
              key={mensagem.id_mensagem}
              className={
                mensagem.id_user === meuId ? "mensagem minha" : "mensagem"
              }
            >
              <strong>{mensagem.utilizador?.nome}</strong>
              <p>{mensagem.texto}</p>
            </div>
          ))
        )}
      </div>

      <div className="enviar-chat-box">
        <input
          type="text"
          placeholder="Escrever mensagem..."
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") enviarMensagem();
          }}
        />

        <button onClick={enviarMensagem}>Enviar</button>
      </div>
    </div>
  );
}

export default ChatMensagem;