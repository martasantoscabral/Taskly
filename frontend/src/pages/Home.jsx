import { useEffect, useState } from "react";
import Feed from "./Feed";
import Grupos from "./Grupos";
import Amigos from "./Amigos";

import Desafio from "./Desafio";

import Users from "./Users";
import Desafios from "./Desafios";
import Reports from "./Reports";
import Weather from './Weather';

import "../css/home.css";

function Tasks({ user, onLogout }) {
  const MENU = [
    //para user normal
    { id: "Home" },
    { id: "Feed" },
    { id: "Grupos" },
    { id: "Amigos" },

    //para user USER acrescenta essa opções no menu
    ...(user?.role === "USER"
      ? [{ id: "Desafio" }] //ver desafios
      : []),
  

    //para user ADMIN acrescenta essas opções no menu
    ...(user?.role === "ADMIN"
      ? [{ id: "Users" }, { id: "Desafios" }, { id: "Reports" }]
      : []),
  ];


  // Depois do Login abre na página "Home".
  const [paginaAtual, setPaginaAtual] = useState("Home");
  
  // Booleano que controla se o formulário de + tarefa está visível.
  const [mostrarPopup, setMostrarPopup] = useState(false);

  // Array com todas as tarefas do utilizador, carregadas da API.
  const [tarefas, setTarefas] = useState([]);


  // ----- CAMPOS DO FORMULÁRIO DE NOVA TAREFA ----------------------
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [estado, setEstado] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [subTasks, setSubTasks] = useState([]);
  const [novaSubTask, setNovaSubTask] = useState("");
  const [sugestoesIA, setSugestoesIA] = useState([]);


  const BASE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const API_TASKS = `${BASE_API_URL}/api/tasks`;
  const token = localStorage.getItem("token");

  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescricao, setEditDescricao] = useState("");
  const [editPrioridade, setEditPrioridade] = useState("");
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [editSubTasks, setEditSubTasks] = useState([]);
  const [editNovaSubTask, setEditNovaSubTask] = useState("");

  /**
   * Remove os dados do localStorage (token e user)
   * vai para a página de login.
   */
  function sair() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
  }



  /**
   * Cria uma nova tarefa com os dados do formulário.
   * Depois de criar, recarrega a lista de tarefas e esconde o formulário.
   */
  async function criarTarefa() {
    const novaTarefa = {
      title: titulo,
      description: descricao || null,
      priority: prioridade || "BAIXA",
      status: estado || "PENDING",
      dueDate: dataFinal ? new Date(dataFinal).toISOString() : null,
      subTasks: subTasks.map((s) => ({
        titulo: s.titulo,
        concluida: false,
      })),
    };

    const res = await fetch(API_TASKS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novaTarefa),
    });

    if (!res.ok) {
      console.log("Erro ao criar tarefa:", await res.text());
      return;
    }

    setTitulo("");
    setDescricao("");
    setPrioridade("");
    setEstado("");
    setDataFinal("");
    setSubTasks([]);
    setNovaSubTask("");
    setMostrarPopup(false);
    carregarTarefas();
  }



  /**Adiciona uma nova subtarefa */
  function adicionarSubtarefa() {
    if (!novaSubTask.trim()) return;

    setSubTasks([
    // Copia todas as subtarefas existentes e adiciona uma nova no final
      ...subTasks,  //(...) copia os elementos do array subTasks,
      {
        titulo: novaSubTask,
        concluida: false,
      },
    ]);
    setNovaSubTask("");
  }

  async function carregarTarefas() {
    const res = await fetch(API_TASKS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setTarefas(data);
  }

  useEffect(() => {
    carregarTarefas();
  }, []);


  async function atualizarTarefa(id, dados) {
    const { subTasks, user, publicacoesFeed, reports, aiResponses, createdAt, ...dadosLimpos } = dados;

    const res = await fetch(`${API_TASKS}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosLimpos),
    });

    if (!res.ok) {
      console.log("Erro ao atualizar:", await res.text());
      return;
    }

    carregarTarefas();
  }



  async function atualizarSubTarefa(idTarefa, idSubTask, dados) {
    const res = await fetch(`${API_TASKS}/${idTarefa}/subtasks/${idSubTask}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    if (!res.ok) {
      console.log("Erro ao atualizar subtarefa:", await res.text());
      return;
    }

    carregarTarefas();
  }


  function mudarEstado(tarefa) {
    const proximoEstado =
      tarefa.status === "PENDING" ? "DOING" :
      tarefa.status === "DOING" ? "DONE" :
      "PENDING";
    atualizarTarefa(tarefa.id, { ...tarefa, status: proximoEstado });
  }


  function abrirEdicao(tarefa) {
    setTarefaEditando(tarefa);
    setEditTitulo(tarefa.title);
    setEditDescricao(tarefa.description);
    setEditPrioridade(tarefa.priority);
    setEditSubTasks(tarefa.subTasks || []);
    setEditNovaSubTask("");
  }

  async function guardarEdicao() {
    if (!tarefaEditando) return;

    // atualizar tarefa principal
    await atualizarTarefa(tarefaEditando.id, {
      title: editTitulo,
      description: editDescricao,
      priority: editPrioridade,
      status: tarefaEditando.status,
      dueDate: tarefaEditando.dueDate,
    });

    // subtarefas antigas
    const antigas = tarefaEditando.subTasks || [];

    // atualizar ou criar
    for (const sub of editSubTasks) {
      // nova subtarefa
      if (sub.nova) {
        await fetch(`${API_TASKS}/${tarefaEditando.id}/subtasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            titulo: sub.titulo,
            concluida: false,
          }),
        });
      }

      // editar existente
      else {
        await atualizarSubTarefa(
          tarefaEditando.id,
          sub.id_subtask,
          {
            titulo: sub.titulo,
            concluida: sub.concluida,
          }
        );
      }
    }

    // apagar removidas
    for (const antiga of antigas) {
      const aindaExiste = editSubTasks.find(
        (s) => s.id_subtask === antiga.id_subtask
      );

      if (!aindaExiste) {
        await fetch(
          `${API_TASKS}/${tarefaEditando.id}/subtasks/${antiga.id_subtask}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    }
    carregarTarefas();
    setTarefaEditando(null);
  }
  
  function adicionarSubtarefaEdit() {
    if (!editNovaSubTask.trim()) return;
    setEditSubTasks([
      ...editSubTasks,
      {
        titulo: editNovaSubTask,
        concluida: false,
        nova: true,
      },
    ]);
    setEditNovaSubTask("");
  }

  function alterarSubtarefaEdit(index, novoTitulo) {
    setEditSubTasks(
      editSubTasks.map((s, i) =>
        i === index ? { ...s, titulo: novoTitulo } : s
      )
    );
  }

  function apagarSubtarefaEdit(index) {
    setEditSubTasks(editSubTasks.filter((_, i) => i !== index));
  }

  function calcularProgresso(tarefa) {
    const total = tarefa.subTasks?.length || 0;

    // sem subtarefas
    if (total === 0) {
      if (tarefa.status === "DONE") return 100;
      if (tarefa.status === "DOING") return 50;
      return 0;
    }

    // com subtarefas
    const feitas = tarefa.subTasks.filter((s) => s.concluida).length;

    return Math.round((feitas / total) * 100);
  }


  async function gerarSubtarefasIA() {
    if (!titulo.trim()) {
      alert("Escreve primeiro o título da tarefa.");
      return;
    }

    console.log("A enviar para IA:", {
      title: titulo,
      description: descricao || "",
    });

    const res = await fetch(`${BASE_API_URL}/api/tasks/ai/subtasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: titulo,
        description: descricao || "",
      }),
    });

    const data = await res.json();

    console.log("Resposta IA:", data);

    if (!res.ok) {
      console.log("Erro IA:", data);
      return;
    }

    const lista = data.subTasks || [];

    setSugestoesIA(
      lista.map((titulo) => ({
        titulo,
        concluida: false,
      }))
    );
  }
  






  return (
    <div className="pagina">
      <aside className="menu-lateral">
        <div className="logo">
          <img src={`${import.meta.env.BASE_URL}taskly-icon-48.png`} alt="logo" className="icon-logo" />
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="logo" className="imagem-logo" />
        </div>

        <p className="titulo-menu">Menu</p>

        <nav className="lista-menu">
          {MENU.map((item) => (
            <button
              key={item.id}
              className={paginaAtual === item.id ? "botao-menu ativo" : "botao-menu"}
              onClick={() => setPaginaAtual(item.id)}
            >
              {item.id}
            </button>
          ))}
        </nav>

        <div className="fundo-menu">
          <button className="botao-sair" onClick={sair}>
            Sair
          </button>
        </div>
      </aside>

      <main className="conteudo">
        {paginaAtual === "Home" && (
          <>
          <div className="pagina-user">
            <header className="cartao-topo">
              <div className="linha-data">
                <span className="etiqueta-hoje">📅 Today</span>
                <strong>{new Date().toLocaleString() + ""} <section><Weather/></section></strong>
              </div>

              <div className="linha-botoes">
                <button className="botao-claro" onClick={() => setMostrarPopup(true)}>
                  + Tarefa
                </button>
                <button className="botao-filtro">☰ Filtro</button>
                <button className="botao-redondo">✦</button>
              </div>
            </header>

            <section className="cabecalho-tarefas">
              <div>
                <h1>Tarefas</h1>
                <p>Bem-vindo de volta · {new Date().toLocaleString() + ""}</p>
              </div>
            </section>
          </div>
            <section className="resumo-tarefas">
              <div className="cartao-resumo">
                <span>TOTAL</span>
                <h2>{tarefas.length}</h2>
                <p>tarefas criadas</p>
              </div>

              <div className="cartao-resumo">
                <span>EM PROGRESSO</span>
                <h2>{tarefas.filter((t) => t.status === "DOING").length}</h2>
                <p>a decorrer</p>
              </div>

              <div className="cartao-resumo">
                <span>CONCLUÍDAS</span>
                <h2>{tarefas.filter((t) => t.status === "DONE").length}</h2>
                <p>finalizadas</p>
              </div>

              <div className="cartao-resumo">
                <span>HISTORICO</span>
                <h2></h2>
                <img src="/loading.svg" alt="loading" className="loading-logo" />
              </div>
            </section>

            <section className="tarefas">
              {tarefas.length === 0 ? (
                <section className="sem-tarefas">
                  <h2>Ainda não tens tarefas</h2>
                  <p>Cria a tua primeira tarefa e começa a organizar o teu dia.</p>
                </section>
              ) : (
                <section className="lista-tarefas">
                  {tarefas.map((tarefa, index) => {
                    const progresso = calcularProgresso(tarefa);

                    return (
                      <div
                        className="cartao-tarefa"
                        key={tarefa.id || index}
                        onClick={() => setTarefaSelecionada(tarefa)}
                      >
                        <button
                          className="botao-editar"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirEdicao(tarefa);
                          }}
                        >
                          🖌️
                        </button>

                        <div>
                          <h3>{tarefa.title}</h3>
                          <p>{tarefa.description}</p>
                          <small>{tarefa.priority} · {tarefa.status}</small>

                          {progresso !== null && (
                            <div className="progresso-tarefa">
                              <div className="linha-progresso">
                                <div
                                  className="linha-progresso-preenchida"
                                  style={{ width: `${progresso}%` }}
                                />
                              </div>

                              <span>{progresso}% feito</span>
                            </div>
                          )}

                          <div className="subtarefas">
                            {tarefa.subTasks?.map((subTask) => (
                              <p key={subTask.id_subtask}>↳ {subTask.titulo}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </section>
              )}
            </section>
          </>
        )}

        {paginaAtual === "Feed" && <Feed />}
        {paginaAtual === "Grupos" && <Grupos />}
        {paginaAtual === "Amigos" && <Amigos />}


        {/* Só para USER */}  
        {paginaAtual === "Desafio" && <Desafio />} 

        {/* so para ADMIN */}
        {paginaAtual === "Users" && <Users />}
        {paginaAtual === "Desafios" && <Desafios />}
        {paginaAtual === "Reports" && <Reports />}

      </main>

      {mostrarPopup && (
        <div className="fundo-popup">
          <div className="popup-tarefa">
            <button className="fechar-popup" onClick={() => setMostrarPopup(false)}>×</button>

            <h2>Nova Tarefa</h2>
            <label>Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Fazer backend"
            />

            <label>Data Final</label>
            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />

            <div className="duas-colunas">
              <div>
                <label>Prioridade</label>
                <select value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
                  <option value="BAIXA">BAIXA</option>
                  <option value="MEDIA">MEDIA</option>
                  <option value="ALTA">ALTA</option>
                  <option value="URGENTE">URGENTE</option>
                </select>
              </div>

              <div>
                <label>Estado</label>
                <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="PENDING">PENDING</option>
                  <option value="DOING">DOING</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>
            </div>

            <label>Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Implementar endpoints"
            />

            <label>Subtarefas</label>
            <div className="linha-subtarefa">
              <input
                value={novaSubTask}
                onChange={(e) => setNovaSubTask(e.target.value)}
                placeholder="Fazer login"
              />
              <button onClick={adicionarSubtarefa}>+</button>
            </div>

            <ul className="lista-subtarefas lista-subtarefas-scroll">
              {subTasks.map((subTask, index) => (
                <li key={index}>
                  <span>{subTask.titulo}</span>
                </li>
              ))}
            </ul>

            {sugestoesIA.length > 0 && (
              <>
                <label>Sugestões da IA</label>
                <div className="lista-sugestoes-ia">
                  {sugestoesIA.map((sugestao, index) => (
                    <div className="item-sugestao-ia" key={index}>
                      <label>
                        <input
                          type="checkbox"
                          checked={sugestao.aceite}
                          onChange={(e) => {
                            const novas = sugestoesIA.map((s, i) =>
                              i === index
                                ? { ...s, aceite: e.target.checked }
                                : s
                            );
                            setSugestoesIA(novas);
                          }}
                        />
                        {sugestao.titulo}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="linha-botoes-popup">
              {sugestoesIA.length > 0 && (
                <button
                  className="botao-aceitar-ia"
                  onClick={() => {
                    const aceites = sugestoesIA
                      .filter((s) => s.aceite)
                      .map((s) => ({
                        titulo: s.titulo,
                        concluida: false,
                      }));

                    setSubTasks([...subTasks, ...aceites]);
                    setSugestoesIA([]);
                  }}
                >Aceitar selecionadas
                </button>
              )}

              <button className="botao-add" onClick={criarTarefa}>Add</button>

            </div>  
          </div>
        </div>
      )}       

      {tarefaEditando && (
        <div className="fundo-popup">
          <div className="popup-tarefa">
            <button className="fechar-popup" onClick={() => setTarefaEditando(null)}>
              ×
            </button>

            <h2>Editar Tarefa</h2>

            <label>Título</label>
            <input value={editTitulo} onChange={(e) => setEditTitulo(e.target.value)} />

            <label>Prioridade</label>
            <select value={editPrioridade} onChange={(e) => setEditPrioridade(e.target.value)}>
              <option value="BAIXA">BAIXA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="ALTA">ALTA</option>
              <option value="URGENTE">URGENTE</option>
            </select>

            <label>Descrição</label>
            <textarea
              value={editDescricao}
              onChange={(e) => setEditDescricao(e.target.value)}
            />
            <label>Subtarefas</label>

            <div className="linha-subtarefa">
              <input
                value={editNovaSubTask}
                onChange={(e) => setEditNovaSubTask(e.target.value)}
                placeholder="Nova subtarefa"
              />
              <button onClick={adicionarSubtarefaEdit}>+</button>
            </div>

            <div className="lista-subtarefas-edit">
              {editSubTasks.map((subTask, index) => (
                <div className="item-subtarefa-edit" key={subTask.id_subtask || index} >
                  <input
                    value={subTask.titulo}
                    onChange={(e) => alterarSubtarefaEdit(index, e.target.value)}
                  />

                  <button type="button" className="botao-apagar-sub" onClick={() => apagarSubtarefaEdit(index)} > 🗑️ </button>
                </div>
              ))}
            </div>
            <button className="botao-add" onClick={guardarEdicao}>
              Guardar
            </button>
          </div>
        </div>
      )}


      {tarefaSelecionada && (
        <div className="fundo-popup">
          <div className="popup-tarefa popup-detalhes">
            <button className="fechar-popup" onClick={() => setTarefaSelecionada(null)}>
              ×
            </button>

            <h2>{tarefaSelecionada.title}</h2>

            <p className="descricao-detalhes">
              {tarefaSelecionada.description || "Sem descrição."}
            </p>

            {(!tarefaSelecionada.subTasks ||
              tarefaSelecionada.subTasks.length === 0) && (
              <>
                <label>Estado da tarefa</label>

                <select
                  value={tarefaSelecionada.status}
                  onChange={(e) => {
                    const atualizada = {
                      ...tarefaSelecionada,
                      status: e.target.value,
                    };

                    setTarefaSelecionada(atualizada);
                    atualizarTarefa(atualizada.id, atualizada);
                  }}
                >
                  <option value="PENDING">Pendente</option>
                  <option value="DOING">Em progresso</option>
                  <option value="DONE">Concluída</option>
                </select>
              </>
            )}

            <h3 class="subtarefas-titulo">Subtarefas</h3>

            {tarefaSelecionada.subTasks?.length > 0 ? (
              <div className="lista-subtarefas-detalhes">
                {tarefaSelecionada.subTasks.map((subTask, index) => (
                  <div className="item-subtarefa-detalhes" key={subTask.id_subtask || index}>
                    <span>{subTask.titulo}</span>

                    <select
                      value={subTask.concluida ? "DONE" : "PENDING"}
                      onChange={(e) => {
                        const novasSubtarefas = tarefaSelecionada.subTasks.map((s, i) =>
                          i === index ? { ...s, concluida: e.target.value === "DONE" } : s
                        );

                        const atualizada = {
                          ...tarefaSelecionada,
                          subTasks: novasSubtarefas,
                        };

                        setTarefaSelecionada(atualizada);
                        atualizarSubTarefa(tarefaSelecionada.id, subTask.id_subtask,{ concluida: e.target.value === "DONE" });
                      }}>
                      <option value="PENDING">Pendente</option>
                      <option value="DONE">Concluída</option>
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="sem-subtarefas">Esta tarefa não tem subtarefas.</p>
            )}
          </div>
        </div>
      )}




    </div>
  );
}

export default Tasks;