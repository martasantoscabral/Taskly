import { useEffect, useState } from "react";
import ChatMensagem from "./ChatMensagem";
import "../css/grupoDetalhes.css";
import "../css/grupoDetalhes_adicionar.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_GRUPOS = `${API_URL}/api/groups`;
const API_TASKS = `${API_URL}/api/tasks`;
const API_USERS = `${API_URL}/api/users`;

function GrupoDetalhes({ grupo, token, meuId, onVoltar }) {
  const [membros, setMembros] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [paginaChatAberta, setPaginaChatAberta] = useState(false);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(true);

  const [mostrarFormTarefa, setMostrarFormTarefa] = useState(false);
  const [novaTarefa, setNovaTarefa] = useState({
    title: "",
    description: "",
    priority: "MEDIA",
    status: "PENDING",
    responsaveis: [],
  });

  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [tarefaEmEdicao, setTarefaEmEdicao] = useState(null);
  const [aGuardarTarefa, setAGuardarTarefa] = useState(false);
  const [aApagarTarefa, setAApagarTarefa] = useState(false);

  const [mostrarGerirMembros, setMostrarGerirMembros] = useState(false);
  const [utilizadores, setUtilizadores] = useState([]);
  const [pesquisaMembro, setPesquisaMembro] = useState("");
  const [aAlterarMembro, setAAlterarMembro] = useState(false);

  const [mostrarMerge, setMostrarMerge] = useState(false);
  const [tarefaMergeId, setTarefaMergeId] = useState("");
  const [partesRelatorio, setPartesRelatorio] = useState([]);

  async function carregarDetalhes() {
    if (!grupo?.grupo_id) return;

    setACarregar(true);
    setErro("");

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resMembros, resTarefas] = await Promise.all([
        fetch(`${API_GRUPOS}/user?grupo_id=${grupo.grupo_id}`, { headers }),
        fetch(`${API_TASKS}?id_grupo=${grupo.grupo_id}`, { headers }),
      ]);

      setMembros(resMembros.ok ? await resMembros.json() : []);
      setTarefas(resTarefas.ok ? await resTarefas.json() : []);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os detalhes do grupo.");
    } finally {
      setACarregar(false);
    }
  }

  useEffect(() => {
    carregarDetalhes();
  }, [grupo?.grupo_id]);

  const tarefasAFazer = tarefas.filter((t) => t.status === "PENDING");
  const tarefasEmCurso = tarefas.filter((t) => t.status === "DOING");
  const tarefasConcluidas = tarefas.filter((t) => t.status === "DONE");

  const souLider = membros.some(
    (membro) => membro.ut_id === meuId && membro.classe === "LIDER",
  );

  function nomeDoResponsavel(idUser) {
    const membro = membros.find((item) => item.ut_id === idUser);
    return membro?.utilizador?.nome || `User #${idUser}`;
  }

  function estadoBonito(status) {
    if (status === "PENDING") return "A Fazer";
    if (status === "DOING") return "Em Curso";
    return "Concluído";
  }

  async function criarTarefaGrupo() {
    if (!novaTarefa.title.trim()) {
      setErro("Escreve o título da tarefa.");
      return;
    }

    if (novaTarefa.responsaveis.length === 0) {
      setErro("Escolhe pelo menos um responsável.");
      return;
    }

    try {
      const respostas = await Promise.all(
        novaTarefa.responsaveis.map((idUser) =>
          fetch(API_TASKS, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: novaTarefa.title.trim(),
              description: novaTarefa.description.trim(),
              priority: novaTarefa.priority,
              status: novaTarefa.status,
              id_user: Number(idUser),
              id_grupo: grupo.grupo_id,
            }),
          }),
        ),
      );

      if (respostas.some((res) => !res.ok)) {
        setErro("Algumas tarefas não foram criadas.");
        return;
      }

      setNovaTarefa({
        title: "",
        description: "",
        priority: "MEDIA",
        status: "PENDING",
        responsaveis: [],
      });
      setMostrarFormTarefa(false);
      await carregarDetalhes();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível criar a tarefa.");
    }
  }

  async function atualizarEstadoTarefa(tarefa, novoStatus) {
    const dados = {
      title: tarefa.title,
      description: tarefa.description || "",
      priority: tarefa.priority,
      status: novoStatus,
      id_user: tarefa.id_user,
      ...(tarefa.dueDate ? { dueDate: tarefa.dueDate } : {}),
    };

    const res = await fetch(`${API_TASKS}/${tarefa.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    if (!res.ok) {
      setErro("Erro ao atualizar a tarefa.");
      return;
    }

    setTarefaSelecionada(null);
    await carregarDetalhes();
  }

  async function enviarPdfTarefa(taskId, ficheiro) {
    if (!ficheiro) return;

    const formData = new FormData();
    formData.append("pdf", ficheiro);

    const res = await fetch(`${API_TASKS}/${taskId}/pdf`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      setErro("Erro ao enviar PDF.");
      return;
    }

    setTarefaSelecionada(null);
    await carregarDetalhes();
  }

  function adicionarTarefaAoMerge(idSelecionado) {
    setTarefaMergeId(idSelecionado);

    const tarefa = tarefas.find(
      (item) => String(item.id) === String(idSelecionado),
    );

    if (!tarefa || partesRelatorio.some((parte) => parte.id_tarefa === tarefa.id)) {
      return;
    }

    setPartesRelatorio((anteriores) => [
      ...anteriores,
      {
        id: Date.now(),
        id_tarefa: tarefa.id,
        titulo: tarefa.title,
        ordem: anteriores.length + 1,
        responsavel: tarefa.id_user,
        pdfName: tarefa.pdfName,
      },
    ]);
  }

  async function fazerMergeFinal() {
    const partesOrdenadas = [...partesRelatorio].sort(
      (a, b) => Number(a.ordem) - Number(b.ordem),
    );

    if (partesOrdenadas.length === 0) {
      setErro("Escolhe pelo menos uma tarefa com PDF.");
      return;
    }

    const taskIds = partesOrdenadas.map((parte) => parte.id_tarefa);

    const res = await fetch(`${API_TASKS}/${tarefaMergeId}/merge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ taskIds }),
    });

    if (!res.ok) {
      setErro("Erro ao fazer merge dos PDFs.");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-final.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async function carregarUtilizadores() {
    try {
      const res = await fetch(API_USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao carregar utilizadores.");
        return;
      }

      setUtilizadores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os utilizadores.");
    }
  }

  async function abrirGestaoMembros() {
    setErro("");
    setPesquisaMembro("");
    setMostrarGerirMembros(true);
    await carregarUtilizadores();
  }

  async function adicionarMembro(utilizadorId) {
    if (!souLider || aAlterarMembro) return;

    try {
      setAAlterarMembro(true);
      setErro("");

      const res = await fetch(`${API_GRUPOS}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gr_id: grupo.grupo_id,
          ut_id: utilizadorId,
          classe: "MEMBRO",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.error || "Erro ao adicionar membro.");
        return;
      }

      await carregarDetalhes();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível adicionar o membro.");
    } finally {
      setAAlterarMembro(false);
    }
  }

  async function removerMembro(membro) {
    if (!souLider || aAlterarMembro) return;

    if (membro.classe === "LIDER") {
      setErro("O líder não pode ser removido do grupo.");
      return;
    }

    const nome = membro.utilizador?.nome || `User #${membro.ut_id}`;

    if (!window.confirm(`Remover ${nome} deste grupo?`)) return;

    try {
      setAAlterarMembro(true);
      setErro("");

      const res = await fetch(`${API_GRUPOS}/user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gr_id: grupo.grupo_id,
          ut_id: membro.ut_id,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.error || "Erro ao remover membro.");
        return;
      }

      await carregarDetalhes();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível remover o membro.");
    } finally {
      setAAlterarMembro(false);
    }
  }

  function abrirEdicaoTarefa(tarefa) {
    setTarefaEmEdicao({
      ...tarefa,
      description: tarefa.description || "",
      dueDate: tarefa.dueDate
        ? new Date(tarefa.dueDate).toISOString().slice(0, 10)
        : "",
    });
  }

  async function guardarEdicaoTarefa() {
    if (!souLider || !tarefaEmEdicao || aGuardarTarefa) return;

    if (!tarefaEmEdicao.title.trim()) {
      setErro("O título da tarefa é obrigatório.");
      return;
    }

    try {
      setAGuardarTarefa(true);
      setErro("");

      const dados = {
        title: tarefaEmEdicao.title.trim(),
        description: tarefaEmEdicao.description.trim(),
        priority: tarefaEmEdicao.priority,
        status: tarefaEmEdicao.status,
        id_user: Number(tarefaEmEdicao.id_user),
        id_grupo: grupo.grupo_id,
        ...(tarefaEmEdicao.dueDate
          ? { dueDate: new Date(`${tarefaEmEdicao.dueDate}T12:00:00`).toISOString() }
          : {}),
      };

      const res = await fetch(`${API_TASKS}/${tarefaEmEdicao.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dados),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.error || "Erro ao editar a tarefa.");
        return;
      }

      setTarefaEmEdicao(null);
      setTarefaSelecionada(null);
      await carregarDetalhes();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível editar a tarefa.");
    } finally {
      setAGuardarTarefa(false);
    }
  }

  async function apagarTarefa(tarefa) {
    if (!souLider || !tarefa || aApagarTarefa) return;

    if (!window.confirm(`Apagar a tarefa "${tarefa.title}"?`)) return;

    try {
      setAApagarTarefa(true);
      setErro("");

      const res = await fetch(`${API_TASKS}/${tarefa.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.error || "Erro ao apagar a tarefa.");
        return;
      }

      setTarefaSelecionada(null);
      setTarefaEmEdicao(null);
      await carregarDetalhes();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível apagar a tarefa.");
    } finally {
      setAApagarTarefa(false);
    }
  }

  const idsMembros = new Set(membros.map((membro) => membro.ut_id));

  const utilizadoresDisponiveis = utilizadores.filter((utilizador) => {
    if (idsMembros.has(utilizador.id_utilizador)) return false;

    const pesquisa = pesquisaMembro.trim().toLowerCase();

    return [utilizador.nome, utilizador.email, utilizador.handle].some(
      (valor) => (valor || "").toLowerCase().includes(pesquisa),
    );
  });

  function renderTarefa(tarefa) {
    const minhaTarefa = tarefa.id_user === meuId;

    return (
      <button
        type="button"
        className={`tarefa-grupo-card ${
          minhaTarefa ? "minha-tarefa-grupo" : ""
        }`}
        key={tarefa.id}
        onClick={() => setTarefaSelecionada(tarefa)}
      >
        <strong>{tarefa.title}</strong>
        <p>{tarefa.description || "Sem descrição."}</p>
        <small>Responsável: {nomeDoResponsavel(tarefa.id_user)}</small>
      </button>
    );
  }

  if (paginaChatAberta) {
    return (
      <ChatMensagem
        grupoSelecionado={grupo}
        token={token}
        meuId={meuId}
        voltarGrupo={() => setPaginaChatAberta(false)}
      />     
    );
  }

  if (aCarregar) {
    return <div className="grupo-detalhes-loading">A carregar grupo...</div>;
  }

  return (
    <div className="grupo-detalhes-page">
      <header className="grupo-detalhes-hero">
        <div className="grupo-detalhes-topbar">
          <button type="button" className="botao-voltar-grupo" onClick={onVoltar}>
            ← Voltar
          </button>

          <span className="badge-grupo">
            {souLider ? "LIDER" : "MEMBRO"}
          </span>
        </div>

        <div className="grupo-detalhes-info">
          <div>
            <h1>{grupo.nome}</h1>
            <p>
              {membros.length} membros · {tarefas.length} tarefas
            </p>
          </div>

          <div className="acoes-topo-grupo">
            {souLider && (
              <button
                type="button"
                className="botao-criar-topo"
                onClick={abrirGestaoMembros}
              >
                👥 Membros
              </button>
            )}

            {souLider && (
              <button
                type="button"
                className="botao-criar-topo"
                onClick={() => setMostrarFormTarefa(true)}
              >
                + Tarefa
              </button>
            )}

            {souLider && (
              <button
                type="button"
                className="botao-criar-topo"
                onClick={() => setMostrarMerge(true)}
              >
                📄 Merge PDF
              </button>
            )}

            <button
              type="button"
              className="botao-chat-grupo"
              onClick={() => setPaginaChatAberta(true)}
            >
              💬
            </button>
          </div>
        </div>
      </header>

      {erro && <p className="erro-grupos">{erro}</p>}

      <section className="quadro-tarefas-kanban">
        <div className="kanban-coluna">
          <div className="kanban-topo todo-topo">
            <h3>A Fazer</h3>
            <span>{tarefasAFazer.length}</span>
          </div>
          <div className="kanban-lista">
            {tarefasAFazer.length
              ? tarefasAFazer.map(renderTarefa)
              : <p className="sem-tarefas">Sem tarefas.</p>}
          </div>
        </div>

        <div className="kanban-coluna">
          <div className="kanban-topo doing-topo">
            <h3>Em Curso</h3>
            <span>{tarefasEmCurso.length}</span>
          </div>
          <div className="kanban-lista">
            {tarefasEmCurso.length
              ? tarefasEmCurso.map(renderTarefa)
              : <p className="sem-tarefas">Sem tarefas.</p>}
          </div>
        </div>

        <div className="kanban-coluna">
          <div className="kanban-topo done-topo">
            <h3>Concluído</h3>
            <span>{tarefasConcluidas.length}</span>
          </div>
          <div className="kanban-lista">
            {tarefasConcluidas.length
              ? tarefasConcluidas.map(renderTarefa)
              : <p className="sem-tarefas">Sem tarefas.</p>}
          </div>
        </div>
      </section>

      {souLider && mostrarGerirMembros && (
        <div className="fundo-popup">
          <div className="popup-tarefa popup-grupo popup-gerir-membros">
            <button
              type="button"
              className="fechar-popup"
              onClick={() => setMostrarGerirMembros(false)}
            >
              ×
            </button>

            <h2>Gerir membros</h2>
            <p className="texto-ajuda-popup">
              Adiciona novas pessoas ou remove membros do grupo.
            </p>

            <h3>Membros atuais</h3>

            <div className="lista-gerir-membros">
              {membros.map((membro) => (
                <div className="linha-gerir-membro" key={membro.ut_id}>
                  <div className="avatar-gerir-membro">
                    {membro.utilizador?.nome
                      ?.trim()
                      .charAt(0)
                      .toUpperCase() || "U"}
                  </div>

                  <div className="dados-gerir-membro">
                    <strong>
                      {membro.utilizador?.nome || `User #${membro.ut_id}`}
                    </strong>
                    <span>
                      {membro.utilizador?.handle
                        ? `@${membro.utilizador.handle}`
                        : membro.classe}
                    </span>
                  </div>

                  <span className="classe-gerir-membro">{membro.classe}</span>

                  {membro.classe !== "LIDER" && (
                    <button
                      type="button"
                      className="botao-remover-membro"
                      disabled={aAlterarMembro}
                      onClick={() => removerMembro(membro)}
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>

            <h3>Adicionar pessoas</h3>

            <input
              type="search"
              placeholder="Pesquisar por nome, email ou handle..."
              value={pesquisaMembro}
              onChange={(e) => setPesquisaMembro(e.target.value)}
            />

            <div className="lista-gerir-membros lista-adicionar-membros">
              {utilizadoresDisponiveis.length === 0 ? (
                <p className="sem-tarefas">Nenhum utilizador encontrado.</p>
              ) : (
                utilizadoresDisponiveis.map((utilizador) => (
                  <div
                    className="linha-gerir-membro"
                    key={utilizador.id_utilizador}
                  >
                    <div className="avatar-gerir-membro">
                      {utilizador.nome?.trim().charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="dados-gerir-membro">
                      <strong>{utilizador.nome}</strong>
                      <span>
                        {utilizador.handle
                          ? `@${utilizador.handle}`
                          : utilizador.email}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="botao-adicionar-membro"
                      disabled={aAlterarMembro}
                      onClick={() =>
                        adicionarMembro(utilizador.id_utilizador)
                      }
                    >
                      + Adicionar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {mostrarFormTarefa && (
        <div className="fundo-popup">
          <div className="popup-tarefa popup-grupo">
            <button
              type="button"
              className="fechar-popup"
              onClick={() => setMostrarFormTarefa(false)}
            >
              ×
            </button>

            <h2>Nova tarefa do grupo</h2>

            <label>Título</label>
            <input
              value={novaTarefa.title}
              onChange={(e) =>
                setNovaTarefa({ ...novaTarefa, title: e.target.value })
              }
            />

            <label>Descrição</label>
            <textarea
              value={novaTarefa.description}
              onChange={(e) =>
                setNovaTarefa({
                  ...novaTarefa,
                  description: e.target.value,
                })
              }
            />

            <label>Prioridade</label>
            <select
              value={novaTarefa.priority}
              onChange={(e) =>
                setNovaTarefa({
                  ...novaTarefa,
                  priority: e.target.value,
                })
              }
            >
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>

            <label>Responsáveis</label>
            <div className="lista-responsaveis-popup">
              {membros.map((membro) => (
                <label className="responsavel-item" key={membro.ut_id}>
                  <input
                    type="checkbox"
                    checked={novaTarefa.responsaveis.includes(membro.ut_id)}
                    onChange={(e) => {
                      const responsaveis = e.target.checked
                        ? [...novaTarefa.responsaveis, membro.ut_id]
                        : novaTarefa.responsaveis.filter(
                            (id) => id !== membro.ut_id,
                          );

                      setNovaTarefa({ ...novaTarefa, responsaveis });
                    }}
                  />
                  {membro.utilizador?.nome || `User #${membro.ut_id}`}
                </label>
              ))}
            </div>

            <button type="button" className="botao-add" onClick={criarTarefaGrupo}>
              Criar tarefa
            </button>
          </div>
        </div>
      )}

      {mostrarMerge && (
        <div className="fundo-popup">
          <div className="popup-tarefa popup-grupo">
            <button
              type="button"
              className="fechar-popup"
              onClick={() => setMostrarMerge(false)}
            >
              ×
            </button>

            <h2>Preparar Merge PDF</h2>
            <p>Só aparecem tarefas concluídas que já têm PDF enviado.</p>

            <select
              value={tarefaMergeId}
              onChange={(e) => adicionarTarefaAoMerge(e.target.value)}
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
                    <strong>{parte.ordem}. {parte.titulo}</strong>
                    <small>Responsável: {nomeDoResponsavel(parte.responsavel)}</small>
                    <small>PDF: {parte.pdfName}</small>

                    <input
                      type="number"
                      min="1"
                      value={parte.ordem}
                      onChange={(e) =>
                        setPartesRelatorio((anteriores) =>
                          anteriores.map((item) =>
                            item.id === parte.id
                              ? { ...item, ordem: Number(e.target.value) }
                              : item,
                          ),
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setPartesRelatorio((anteriores) =>
                          anteriores.filter((item) => item.id !== parte.id),
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                ))}
            </div>

            <button type="button" className="botao-add" onClick={fazerMergeFinal}>
              Fazer Merge Final
            </button>
          </div>
        </div>
      )}

      {souLider && tarefaEmEdicao && (
        <div className="fundo-popup">
          <div className="popup-tarefa popup-grupo">
            <button
              type="button"
              className="fechar-popup"
              onClick={() => setTarefaEmEdicao(null)}
            >
              ×
            </button>

            <h2>Editar tarefa</h2>

            <label>Título</label>
            <input
              value={tarefaEmEdicao.title}
              onChange={(e) =>
                setTarefaEmEdicao({
                  ...tarefaEmEdicao,
                  title: e.target.value,
                })
              }
            />

            <label>Descrição</label>
            <textarea
              value={tarefaEmEdicao.description}
              onChange={(e) =>
                setTarefaEmEdicao({
                  ...tarefaEmEdicao,
                  description: e.target.value,
                })
              }
            />

            <label>Responsável</label>
            <select
              value={tarefaEmEdicao.id_user}
              onChange={(e) =>
                setTarefaEmEdicao({
                  ...tarefaEmEdicao,
                  id_user: Number(e.target.value),
                })
              }
            >
              {membros.map((membro) => (
                <option key={membro.ut_id} value={membro.ut_id}>
                  {membro.utilizador?.nome || `User #${membro.ut_id}`}
                </option>
              ))}
            </select>

            <label>Prioridade</label>
            <select
              value={tarefaEmEdicao.priority}
              onChange={(e) =>
                setTarefaEmEdicao({
                  ...tarefaEmEdicao,
                  priority: e.target.value,
                })
              }
            >
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>

            <label>Estado</label>
            <select
              value={tarefaEmEdicao.status}
              onChange={(e) =>
                setTarefaEmEdicao({
                  ...tarefaEmEdicao,
                  status: e.target.value,
                })
              }
            >
              <option value="PENDING">A Fazer</option>
              <option value="DOING">Em Curso</option>
              <option value="DONE">Concluído</option>
            </select>

            <label>Data limite</label>
            <input
              type="date"
              value={tarefaEmEdicao.dueDate}
              onChange={(e) =>
                setTarefaEmEdicao({
                  ...tarefaEmEdicao,
                  dueDate: e.target.value,
                })
              }
            />

            <button
              type="button"
              className="botao-add"
              disabled={aGuardarTarefa}
              onClick={guardarEdicaoTarefa}
            >
              {aGuardarTarefa ? "A guardar..." : "Guardar alterações"}
            </button>
          </div>
        </div>
      )}

      {tarefaSelecionada && (
        <div className="modal-tarefa-grupo">
          <div className="modal-tarefa-conteudo">
            <button
              type="button"
              className="fechar-modal-tarefa"
              onClick={() => setTarefaSelecionada(null)}
            >
              ×
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
              <strong>Estado:</strong> {estadoBonito(tarefaSelecionada.status)}
            </p>

            {souLider && (
              <div className="acoes-lider-tarefa">
                <button
                  type="button"
                  className="botao-editar-tarefa"
                  onClick={() => abrirEdicaoTarefa(tarefaSelecionada)}
                >
                  ✏️ Editar tarefa
                </button>

                <button
                  type="button"
                  className="botao-apagar-tarefa"
                  disabled={aApagarTarefa}
                  onClick={() => apagarTarefa(tarefaSelecionada)}
                >
                  {aApagarTarefa ? "A apagar..." : "🗑️ Apagar tarefa"}
                </button>
              </div>
            )}

            {tarefaSelecionada.id_user === meuId && (
              <div className="acoes-estado-tarefa">
                <button
                  type="button"
                  onClick={() =>
                    atualizarEstadoTarefa(tarefaSelecionada, "PENDING")
                  }
                >
                  A fazer
                </button>
                <button
                  type="button"
                  onClick={() =>
                    atualizarEstadoTarefa(tarefaSelecionada, "DOING")
                  }
                >
                  Em curso
                </button>
                <button
                  type="button"
                  onClick={() =>
                    atualizarEstadoTarefa(tarefaSelecionada, "DONE")
                  }
                >
                  Concluído
                </button>
              </div>
            )}

            {tarefaSelecionada.status === "DONE" &&
              tarefaSelecionada.id_user === meuId && (
                <div className="upload-pdf-tarefa">
                  <label>Upload PDF da tarefa</label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) =>
                      enviarPdfTarefa(
                        tarefaSelecionada.id,
                        e.target.files?.[0],
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
  );
}

export default GrupoDetalhes;