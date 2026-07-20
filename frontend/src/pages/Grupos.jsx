import { useEffect, useState } from "react";
import ChatMensagem from "./ChatMensagem";
import "../css/grupos.css";

function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [membros, setMembros] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [paginaChatAberta, setPaginaChatAberta] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState("");
  const [erro, setErro] = useState("");

  const [mostrarFormTarefa, setMostrarFormTarefa] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({
    title: "",
    description: "",
    priority: "MEDIA",
    status: "PENDING",
    responsaveis: [],
  });
  const [tarefaMergeId, setTarefaMergeId] = useState("");

  // TaskMerge - preparação das partes de um relatório/PDF
  const [mostrarMerge, setMostrarMerge] = useState(false);
  const [partesRelatorio, setPartesRelatorio] = useState([]);
  const [novaParte, setNovaParte] = useState({
    titulo: "",
    ordem: "",
    responsavel: "",
  });

  const API_GRUPOS = "http://localhost:3000/api/groups";
  const API_TASKS = "http://localhost:3000/api/tasks";
  const API_CHAT = "http://localhost:3000/api/chat";

  const token = localStorage.getItem("token");
  const userGuardado = JSON.parse(localStorage.getItem("user"));
  const meuId = userGuardado?.id_utilizador;

  async function carregarGrupos() {
    const res = await fetch(`${API_GRUPOS}/by-user?ut_id=${meuId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setErro("Erro ao carregar grupos");
      return;
    }

    const data = await res.json();
    setGrupos(data);
  }

  async function criarGrupo() {
    if (!nomeGrupo.trim()) return;

    const res = await fetch(API_GRUPOS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nome: nomeGrupo }),
    });

    if (!res.ok) {
      setErro("Erro ao criar grupo");
      return;
    }

    setNomeGrupo("");
    carregarGrupos();
  }

  async function abrirGrupo(item) {
    setGrupoSelecionado(item.grupo);
    setErro("");
    setTarefaSelecionada(null);

    const grupoId = item.grupo.grupo_id;

    const resMembros = await fetch(`${API_GRUPOS}/user?grupo_id=${grupoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let dataMembros = [];

    if (resMembros.ok) {
      dataMembros = await resMembros.json();
      setMembros(dataMembros);
    }

    const resTarefas = await fetch(`${API_TASKS}?id_grupo=${grupoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (resTarefas.ok) {
      const dataTarefas = await resTarefas.json();
      setTarefas(dataTarefas);
    } else {
      setTarefas([]);
    }

    const resChat = await fetch(`${API_CHAT}/group/${grupoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (resChat.ok) {
      const dataChat = await resChat.json();
      setMensagens(dataChat);
    }
  }

  async function atualizarEstadoTarefa(tarefa, novoStatus) {
    const dados = {
      title: tarefa.title,
      description: tarefa.description || "",
      priority: tarefa.priority,
      status: novoStatus,
      id_user: tarefa.id_user,
    };

    if (tarefa.dueDate) {
      dados.dueDate = tarefa.dueDate;
    }

    const res = await fetch(`${API_TASKS}/${tarefa.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    if (!res.ok) {
      const erroApi = await res.json();
      console.error("Erro ao atualizar tarefa:", erroApi);
      setErro("Erro ao atualizar tarefa");
      return;
    }
    setTarefaSelecionada(null);
    abrirGrupo({ grupo: grupoSelecionado });
  }


  async function criarTarefaGrupo() {
    if (!novaTarefa.title.trim()) return;

    if (novaTarefa.responsaveis.length === 0) {
      setErro("Escolhe pelo menos um responsável");
      return;
    }

    for (const idUser of novaTarefa.responsaveis) {
      await fetch(API_TASKS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
        title: novaTarefa.title,
        description: novaTarefa.description,
        priority: novaTarefa.priority,
        status: novaTarefa.status,
        id_user: Number(idUser),
        id_grupo: grupoSelecionado.grupo_id,
        }),
      });
    }

    setNovaTarefa({
      title: "",
      description: "",
      priority: "MEDIA",
      status: "PENDING",
      responsaveis: [],
    });

    setMostrarFormTarefa(false);
    abrirGrupo({ grupo: grupoSelecionado });
  }


  function adicionarParteRelatorio() {
    if (!novaParte.titulo.trim() || !novaParte.ordem || !novaParte.responsavel) {
      setErro("Preenche o título, a ordem e o responsável da parte.");
      return;
    }

    setPartesRelatorio([
      ...partesRelatorio,
      {
        id: Date.now(),
        titulo: novaParte.titulo,
        ordem: Number(novaParte.ordem),
        responsavel: Number(novaParte.responsavel),
        ficheiro: null,
      },
    ]);
    setNovaParte({
      titulo: "",
      ordem: "",
      responsavel: "",
    });
    setErro("");
  }

  function removerParteRelatorio(idParte) {
    setPartesRelatorio(partesRelatorio.filter((parte) => parte.id !== idParte));
  }
  

  function atualizarFicheiroParte(idParte, ficheiro) {
    setPartesRelatorio(
      partesRelatorio.map((parte) =>
        parte.id === idParte ? { ...parte, ficheiro } : parte
      )
    );
  }

  function alterarOrdemParte(idParte, novaOrdem) {
    setPartesRelatorio(
      partesRelatorio.map((parte) =>
        parte.id === idParte ? { ...parte, ordem: Number(novaOrdem) } : parte
      )
    );
  }



    
  async function fazerMergeFinal() {
    const partesOrdenadas = [...partesRelatorio].sort(
      (a, b) => Number(a.ordem) - Number(b.ordem)
    );

    if (partesOrdenadas.length === 0) {
      setErro("Escolhe pelo menos uma tarefa com PDF.");
      return;
    }

    const taskIds = partesOrdenadas.map((parte) => parte.id_tarefa);

    const res = await fetch(
      `http://localhost:3000/api/tasks/${tarefaMergeId}/merge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskIds,
        }),
      }
    );

    if (!res.ok) {
      const erroTexto = await res.text();
      console.error("Erro merge:", erroTexto);
      setErro("Erro ao fazer merge dos PDFs.");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-final.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  }

  
  async function enviarPdfTarefa(taskId, ficheiro) {
    if (!ficheiro) return;

    const formData = new FormData();
    formData.append("pdf", ficheiro);

    const res = await fetch(`http://localhost:3000/api/tasks/${taskId}/pdf`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      setErro("Erro ao enviar PDF.");
      return;
    }

    setErro("");
    setTarefaSelecionada(null);
    abrirGrupo({ grupo: grupoSelecionado });
  }

  useEffect(() => {
    carregarGrupos();
  }, []);

  const tarefasAFazer = tarefas.filter((t) => t.status === "PENDING");
  const tarefasEmCurso = tarefas.filter((t) => t.status === "DOING");
  const tarefasConcluidas = tarefas.filter((t) => t.status === "DONE");

  const souLider = membros.some(
    (m) => m.ut_id === meuId && m.classe === "LIDER"
  );

  function nomeDoResponsavel(idUser) {
    const membro = membros.find((m) => m.ut_id === idUser);
    return membro?.utilizador?.nome || `User #${idUser}`;
  }

  function estadoBonito(status) {
    if (status === "PENDING") return "A Fazer";
    if (status === "DOING") return "Em Curso";
    return "Concluído";
  }

  function renderTarefa(tarefa) {
    const minhaTarefa = tarefa.id_user === meuId;

    return (
      <div
        className={`tarefa-grupo-card ${
          minhaTarefa ? "minha-tarefa-grupo" : ""
        }`}
        key={tarefa.id}
        onClick={() => setTarefaSelecionada(tarefa)}
      >
        <strong>{tarefa.title}</strong>
        <p>{tarefa.description}</p>
        <small>Responsável: {nomeDoResponsavel(tarefa.id_user)}</small>
      </div>
    );
  }

  if (grupoSelecionado && paginaChatAberta) {
    return (
      <ChatMensagem
        grupoSelecionado={grupoSelecionado}
        mensagens={mensagens}
        setMensagens={setMensagens}
        token={token}
        meuId={meuId}
        voltarGrupo={() => setPaginaChatAberta(false)}
      />
    );
  }

  if (grupoSelecionado) {
    return (
      <div className="pagina-grupos">
        <div className="grupo-layout-racunho">
          <header className="grupo-topo-racunho">
            <div className="lado-esquerdo-grupo">
              <button className="botao-voltar-grupo" onClick={() => {
                  setGrupoSelecionado(null);
                  setPaginaChatAberta(false);
                }}
              > ← Voltar
              </button>


              <div className="grupo-card-principal">
                <div className="info-grupo-central">
                  <h2>{grupoSelecionado.nome}</h2>
                  <p>{membros.length} membros • {tarefas.length} tarefas</p>
                </div>

                <div className="acoes-topo-grupo">
                  {souLider && (
                    <button className="botao-criar-topo" onClick={() => setMostrarFormTarefa(true)}>+ Tarefa </button>
                  )}

                  {souLider && (
                    <button className="botao-criar-topo" onClick={() => setMostrarMerge(true)} >📄 Merge PDF</button>
                  )}

                  <button className="botao-chat-grupo" onClick={() => setPaginaChatAberta(true)}> 💬
                    {mensagens.length > 0 && (
                      <span>{mensagens.length}</span>
                    )}
                  </button>

                </div>
              </div>


            </div>

            <span className="badge-grupo">{souLider ? "LIDER" : "MEMBRO"}</span>

            {souLider && mostrarFormTarefa && (
              <div className="fundo-popup">
                <div className="popup-tarefa popup-grupo">
                  <button className="fechar-popup" onClick={() => setMostrarFormTarefa(false)}>× </button>
                  <h2>Nova tarefa do grupo</h2>

                  <label>Título</label>
                  <input placeholder="Título" value={novaTarefa.title}
                    onChange={(e) =>setNovaTarefa({ ...novaTarefa, title: e.target.value })}
                  />

                  <label>Descrição</label>
                  <textarea placeholder="Descrição" value={novaTarefa.description}
                    onChange={(e) => setNovaTarefa({ ...novaTarefa, description: e.target.value })}
                  />

                  <label>Responsáveis</label>
                  <div className="lista-responsaveis-popup">
                    {membros.map((membro) => (
                      <label className="responsavel-item" key={membro.ut_id}>
                        <input type="checkbox"  checked={novaTarefa.responsaveis.includes(membro.ut_id)}
                          onChange={(e) => {
                            const responsaveis = e.target.checked
                              ? [...novaTarefa.responsaveis, membro.ut_id]
                              : novaTarefa.responsaveis.filter((id) => id !== membro.ut_id);

                            setNovaTarefa({ ...novaTarefa, responsaveis });
                          }}
                        />

                        {membro.utilizador?.nome || `User #${membro.ut_id}`}
                      </label>
                    ))}
                  </div>
                  <button className="botao-add" onClick={criarTarefaGrupo}>Criar tarefa</button>
                </div>
              </div>
            )}

            {souLider && mostrarMerge && (
              <div className="fundo-popup">
                <div className="popup-tarefa popup-grupo">
                  <button
                    className="fechar-popup"
                    onClick={() => setMostrarMerge(false)}
                  >
                    ×
                  </button>

                  <h2>Preparar Merge PDF</h2>

                  <p className="texto-ajuda-merge">
                    Só aparecem aqui tarefas concluídas que já têm PDF enviado.
                  </p>

                  <label>Tarefa com PDF</label>

                  <select
                    value={tarefaMergeId}
                    onChange={(e) => {
                      const idSelecionado = e.target.value;
                      setTarefaMergeId(idSelecionado);

                      const tarefaEscolhida = tarefas.find(
                        (tarefa) => String(tarefa.id) === idSelecionado
                      );

                      if (tarefaEscolhida) {
                        const jaExiste = partesRelatorio.some(
                          (parte) => parte.id_tarefa === tarefaEscolhida.id
                        );

                        if (!jaExiste) {
                          setPartesRelatorio([
                            ...partesRelatorio,
                            {
                              id: Date.now(),
                              id_tarefa: tarefaEscolhida.id,
                              titulo: tarefaEscolhida.title,
                              ordem: partesRelatorio.length + 1,
                              responsavel: tarefaEscolhida.id_user,
                              pdfName: tarefaEscolhida.pdfName,
                              pdfPath: tarefaEscolhida.pdfPath,
                            },
                          ]);
                        }
                      }
                    }}
                  >
                    <option value="">Escolher tarefa</option>

                    {tarefas
                      .filter((tarefa) => tarefa.status === "DONE" && tarefa.pdfPath)
                      .map((tarefa) => (
                        <option key={tarefa.id} value={tarefa.id}>
                          {tarefa.title} — {tarefa.pdfName}
                        </option>
                      ))}
                  </select>

                  <div className="lista-partes-merge">
                    {[...partesRelatorio]
                      .sort((a, b) => Number(a.ordem) - Number(b.ordem))
                      .map((parte) => (
                        <div className="item-parte-merge" key={parte.id}>
                          <strong>
                            {parte.ordem}. {parte.titulo}
                          </strong>

                          <small>
                            Responsável: {nomeDoResponsavel(parte.responsavel)}
                          </small>

                          <small>
                            PDF: {parte.pdfName}
                          </small>

                          <label>Ordem</label>
                          <input
                            type="number"
                            value={parte.ordem}
                            onChange={(e) => alterarOrdemParte(parte.id, e.target.value)}
                          />

                          <button onClick={() => removerParteRelatorio(parte.id)}>
                            Remover
                          </button>
                        </div>
                      ))}
                  </div>

                  <button className="botao-add" onClick={fazerMergeFinal}>
                    Fazer Merge Final
                  </button>
                </div>
              </div>
            )}




          </header>         

          <section className="quadro-tarefas-kanban">
            <div className="kanban-coluna">
              <div className="kanban-topo todo-topo">
                <h3>A Fazer</h3>
                <span>{tarefasAFazer.length}</span>
              </div>

              <div className="kanban-lista">
                {tarefasAFazer.length === 0 ? (
                  <p className="sem-tarefas">Sem tarefas.</p>
                ) : (
                  tarefasAFazer.map(renderTarefa)
                )}
              </div>
            </div>


            <div className="kanban-coluna">
              <div className="kanban-topo doing-topo">
                <h3>Em Curso</h3>
                <span>{tarefasEmCurso.length}</span>
              </div>

              <div className="kanban-lista">
                {tarefasEmCurso.length === 0 ? (
                  <p className="sem-tarefas">Sem tarefas.</p>
                ) : (
                  tarefasEmCurso.map(renderTarefa)
                )}
              </div>
            </div>


            <div className="kanban-coluna">
              <div className="kanban-topo done-topo">
                <h3>Concluído</h3>
                <span>{tarefasConcluidas.length}</span>
              </div>

              <div className="kanban-lista">
                {tarefasConcluidas.length === 0 ? (
                  <p className="sem-tarefas">Sem tarefas.</p>
                ) : (
                  tarefasConcluidas.map(renderTarefa)
                )}
              </div>
            </div>

          </section>

          {tarefaSelecionada && (
            <div className="modal-tarefa-grupo">
              <div className="modal-tarefa-conteudo">
                <button
                  className="fechar-modal-tarefa"
                  onClick={() => setTarefaSelecionada(null)}
                >
                  X
                </button>

                <h2>{tarefaSelecionada.title}</h2>
                <p>{tarefaSelecionada.description}</p>

                <p>
                  <strong>Responsável:</strong>{" "}
                  {nomeDoResponsavel(tarefaSelecionada.id_user)}
                </p>

                <p>
                  <strong>Prioridade:</strong> {tarefaSelecionada.priority}
                </p>

                <p>
                  <strong>Estado:</strong>{" "}
                  {estadoBonito(tarefaSelecionada.status)}
                </p>

                {tarefaSelecionada.id_user === meuId && (
                  <div className="acoes-estado-tarefa">
                    <button onClick={() => atualizarEstadoTarefa(tarefaSelecionada, "PENDING")}>
                      A fazer
                    </button>

                    <button onClick={() => atualizarEstadoTarefa(tarefaSelecionada, "DOING")}>
                      Em curso
                    </button>

                    <button onClick={() => atualizarEstadoTarefa(tarefaSelecionada, "DONE")}>
                      Concluído
                    </button>
                  </div>
                )}

                {tarefaSelecionada.status === "DONE" && tarefaSelecionada.id_user === meuId && (
                  <div className="upload-pdf-tarefa">
                    <label>Upload PDF da tarefa</label>

                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        enviarPdfTarefa(
                          tarefaSelecionada.id,
                          e.target.files?.[0]
                        )
                      }
                    />
                  </div>
                )}

                {tarefaSelecionada.pdfName && (
                  <p className="pdf-ja-enviado">
                    PDF enviado: <strong>{tarefaSelecionada.pdfName}</strong>
                  </p>
                )}
              </div>
            </div>
          )}


        </div>
      </div>
    );
  }
    
  return (
    <div className="pagina-grupos">
      <header className="cartao-topo">
        <div className="linha-data">
          <span className="etiqueta-hoje">👥 Groups</span>
          <strong>Qui, 23 de Abril</strong>
        </div>
      </header>

      <section className="cabecalho-grupos">
        <div>
          <h1>Grupos</h1>
          <p>Cria grupos e colabora com outros utilizadores.</p>
        </div>
      </section>

      {erro && <p className="erro-grupos">{erro}</p>}

      <div className="grupo-formulario">
        <input
          type="text"
          placeholder="Nome do grupo..."
          value={nomeGrupo}
          onChange={(e) => setNomeGrupo(e.target.value)}
        />

        <button onClick={criarGrupo}>+ Criar grupo</button>
      </div>

      {grupos.length === 0 ? (
        <div className="estado-vazio-grupos">
          <div className="icone-vazio">👥</div>
          <h3>Ainda não estás em nenhum grupo.</h3>
        </div>
      ) : (
        <div className="grelha-grupos">
          {grupos.map((item) => (
            <div
              className="cartao-grupo"
              key={item.grupo.grupo_id}
              onClick={() => abrirGrupo(item)}
            >
              <div className="topo-cartao-grupo">
                <div>
                  <h3>{item.grupo.nome}</h3>
                  <p className="descricao-grupo">Grupo colaborativo</p>
                </div>

                <span className="badge-grupo">{item.classe}</span>
              </div>

              <div className="info-grupo">
                <span>ID #{item.grupo.grupo_id}</span>
              </div>

              <div className="acoes-grupo">
                <button>Ver grupo</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Grupos;