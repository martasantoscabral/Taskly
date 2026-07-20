import { useEffect, useMemo, useState } from "react";
import GrupoDetalhes from "./GrupoDetalhes";
import "../css/grupos.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_GRUPOS = `${API_URL}/api/groups`;
const API_USERS = `${API_URL}/api/users`;

function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [pesquisaGrupo, setPesquisaGrupo] = useState("");

  const [mostrarModalGrupo, setMostrarModalGrupo] = useState(false);
  const [novoGrupo, setNovoGrupo] = useState({ nome: "", membros: [] });
  const [utilizadores, setUtilizadores] = useState([]);
  const [pesquisaUtilizador, setPesquisaUtilizador] = useState("");
  const [aCriarGrupo, setACriarGrupo] = useState(false);
  const [erro, setErro] = useState("");

  const token = localStorage.getItem("token");
  const userGuardado = JSON.parse(localStorage.getItem("user") || "null");
  const meuId = userGuardado?.id_utilizador;

  async function lerResposta(res) {
    const tipo = res.headers.get("content-type");
    return tipo?.includes("application/json")
      ? res.json()
      : { error: await res.text() };
  }

  async function carregarGrupos() {
    if (!meuId || !token) return;

    try {
      const res = await fetch(`${API_GRUPOS}/by-user?ut_id=${meuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await lerResposta(res);

      if (!res.ok) {
        setErro(data.error || "Erro ao carregar grupos.");
        return;
      }

      setGrupos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível comunicar com o servidor.");
    }
  }

  async function carregarUtilizadores() {
    try {
      const res = await fetch(API_USERS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await lerResposta(res);

      if (!res.ok) {
        setErro(data.error || "Erro ao carregar utilizadores.");
        return;
      }

      setUtilizadores(
        (Array.isArray(data) ? data : []).filter(
          (user) => user.id_utilizador !== meuId,
        ),
      );
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar os utilizadores.");
    }
  }

  function abrirModalCriarGrupo() {
    setNovoGrupo({ nome: "", membros: [] });
    setPesquisaUtilizador("");
    setErro("");
    setMostrarModalGrupo(true);
    carregarUtilizadores();
  }

  function fecharModalCriarGrupo() {
    if (aCriarGrupo) return;
    setMostrarModalGrupo(false);
    setNovoGrupo({ nome: "", membros: [] });
    setPesquisaUtilizador("");
    setErro("");
  }

  function alternarMembro(idUtilizador) {
    setNovoGrupo((anterior) => ({
      ...anterior,
      membros: anterior.membros.includes(idUtilizador)
        ? anterior.membros.filter((id) => id !== idUtilizador)
        : [...anterior.membros, idUtilizador],
    }));
  }

  async function criarGrupo() {
    const nome = novoGrupo.nome.trim();

    if (!nome) {
      setErro("Escreve o nome do grupo.");
      return;
    }

    try {
      setACriarGrupo(true);
      setErro("");

      const resGrupo = await fetch(API_GRUPOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome }),
      });

      const dataGrupo = await lerResposta(resGrupo);

      if (!resGrupo.ok) {
        const validacoes = Array.isArray(dataGrupo.errors)
          ? dataGrupo.errors
              .map((issue) => issue.mensagem || issue.message)
              .filter(Boolean)
              .join(", ")
          : "";

        setErro(
          dataGrupo.error ||
            dataGrupo.message ||
            validacoes ||
            "Erro ao criar grupo.",
        );
        return;
      }

      const grupoCriado = dataGrupo.grupo || dataGrupo;
      const grupoId = grupoCriado.grupo_id;

      if (!grupoId) {
        setErro("O grupo foi criado, mas a API não devolveu o seu ID.");
        return;
      }

      const resultados = await Promise.allSettled(
        novoGrupo.membros.map((utilizadorId) =>
          fetch(`${API_GRUPOS}/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              gr_id: grupoId,
              ut_id: utilizadorId,
              classe: "MEMBRO",
            }),
          }),
        ),
      );

      const membrosComErro = resultados.filter(
        (resultado) =>
          resultado.status === "rejected" ||
          !resultado.value.ok,
      ).length;

      setMostrarModalGrupo(false);
      setNovoGrupo({ nome: "", membros: [] });
      setPesquisaUtilizador("");
      await carregarGrupos();

      if (membrosComErro > 0) {
        setErro(
          `Grupo criado, mas ${membrosComErro} membro(s) não foram adicionados.`,
        );
      }
    } catch (error) {
      console.error(error);
      setErro("Não foi possível comunicar com o servidor.");
    } finally {
      setACriarGrupo(false);
    }
  }

  useEffect(() => {
    carregarGrupos();
  }, [meuId]);

  const gruposFiltrados = useMemo(() => {
    const pesquisa = pesquisaGrupo.trim().toLowerCase();

    return grupos.filter((item) =>
      (item.grupo?.nome || "").toLowerCase().includes(pesquisa),
    );
  }, [grupos, pesquisaGrupo]);

  const utilizadoresFiltrados = useMemo(() => {
    const pesquisa = pesquisaUtilizador.trim().toLowerCase();

    return utilizadores.filter((user) =>
      [user.nome, user.email, user.handle].some((valor) =>
        (valor || "").toLowerCase().includes(pesquisa),
      ),
    );
  }, [utilizadores, pesquisaUtilizador]);

  if (grupoSelecionado) {
    return (
      <GrupoDetalhes
        grupo={grupoSelecionado}
        token={token}
        meuId={meuId}
        onVoltar={() => {
          setGrupoSelecionado(null);
          carregarGrupos();
        }}
      />
    );
  }

  return (
    <div className="pagina-grupos">
      <header className="cartao-topo">
        <div className="linha-data">
          <span className="etiqueta-hoje">👥 Grupos</span>
          <strong>Os teus espaços de colaboração</strong>
        </div>
      </header>

      <section className="cabecalho-grupos">
        <div>
          <h1>Grupos</h1>
          <p>Pesquisa, cria grupos e colabora com outras pessoas.</p>
        </div>
      </section>

      {erro && <p className="erro-grupos">{erro}</p>}

      <div className="grupo-formulario">
        <input
          type="search"
          placeholder="Pesquisar grupos pelo nome..."
          value={pesquisaGrupo}
          onChange={(e) => setPesquisaGrupo(e.target.value)}
        />

        <button type="button" onClick={abrirModalCriarGrupo}>
          + Criar grupo
        </button>
      </div>

      {gruposFiltrados.length === 0 ? (
        <div className="estado-vazio-grupos">
          <div className="icone-vazio">👥</div>
          <h3>
            {pesquisaGrupo
              ? "Nenhum grupo encontrado."
              : "Ainda não estás em nenhum grupo."}
          </h3>
        </div>
      ) : (
        <div className="grelha-grupos">
          {gruposFiltrados.map((item) => (
            <article
              className="cartao-grupo"
              key={item.grupo.grupo_id}
              onClick={() => setGrupoSelecionado(item.grupo)}
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
                <button type="button">Ver grupo</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {mostrarModalGrupo && (
        <div
          className="modal-grupo-overlay"
          onMouseDown={fecharModalCriarGrupo}
        >
          <div
            className="modal-criar-grupo"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-grupo-header">
              <div>
                <h2>Criar novo grupo</h2>
                <p>Define o nome e escolhe as pessoas que vão participar.</p>
              </div>

              <button
                type="button"
                className="modal-grupo-fechar"
                onClick={fecharModalCriarGrupo}
              >
                ×
              </button>
            </div>

            <div className="modal-grupo-campo">
              <label htmlFor="nome-novo-grupo">Nome do grupo</label>
              <input
                id="nome-novo-grupo"
                type="text"
                placeholder="Ex.: Grupo de ASW"
                value={novoGrupo.nome}
                onChange={(e) =>
                  setNovoGrupo((anterior) => ({
                    ...anterior,
                    nome: e.target.value,
                  }))
                }
              />
            </div>

            <div className="modal-grupo-campo">
              <label htmlFor="pesquisar-membros">Adicionar pessoas</label>
              <input
                id="pesquisar-membros"
                type="search"
                placeholder="Pesquisar por nome, email ou handle..."
                value={pesquisaUtilizador}
                onChange={(e) => setPesquisaUtilizador(e.target.value)}
              />
            </div>

            <div className="contador-membros-selecionados">
              {novoGrupo.membros.length} pessoa(s) selecionada(s)
            </div>

            <div className="lista-membros-grupo">
              {utilizadoresFiltrados.length === 0 ? (
                <p className="sem-utilizadores-grupo">
                  Nenhum utilizador encontrado.
                </p>
              ) : (
                utilizadoresFiltrados.map((user) => {
                  const selecionado = novoGrupo.membros.includes(
                    user.id_utilizador,
                  );

                  return (
                    <button
                      type="button"
                      key={user.id_utilizador}
                      className={`membro-grupo-opcao ${
                        selecionado ? "membro-selecionado" : ""
                      }`}
                      onClick={() => alternarMembro(user.id_utilizador)}
                    >
                      <div className="avatar-membro-grupo">
                        {user.nome?.trim().charAt(0).toUpperCase() || "U"}
                      </div>

                      <div className="dados-membro-grupo">
                        <strong>{user.nome}</strong>
                        <span>@{user.handle}</span>
                        <small>{user.email}</small>
                      </div>

                      <div className="check-membro-grupo">
                        {selecionado ? "✓" : "+"}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {erro && <p className="erro-modal-grupo">{erro}</p>}

            <div className="modal-grupo-footer">
              <button
                type="button"
                className="botao-cancelar-grupo"
                onClick={fecharModalCriarGrupo}
                disabled={aCriarGrupo}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="botao-confirmar-grupo"
                onClick={criarGrupo}
                disabled={aCriarGrupo}
              >
                {aCriarGrupo ? "A criar..." : "Criar grupo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Grupos;