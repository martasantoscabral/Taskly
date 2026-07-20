import { useEffect, useState } from "react";
import "../css/desafios.css";

export default function DesafiosAdmin() {
  const [desafios, setDesafios] = useState([]);
  const [erro, setErro] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [desafioEditando, setDesafioEditando] = useState(null);

  const [form, setForm] = useState({
    titulo: "",
    data_inicio: "",
    data_fim: "",
    badge: "",
    notificar: false,
    publicado: false,
  });

  const API_DESAFIOS = "http://localhost:3000/api/challenges";
  const token = localStorage.getItem("token");

  async function carregarDesafios() {
    const res = await fetch(API_DESAFIOS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setDesafios(data);
  }

  async function criarOuEditarDesafio() {
    const dados = {
      titulo: form.titulo,
      data_inicio: new Date(form.data_inicio).toISOString(),
      data_fim: new Date(form.data_fim).toISOString(),
      badge: form.badge,
      notificar: form.notificar,
      publicado: form.publicado,
    };

    const url = desafioEditando
      ? `${API_DESAFIOS}/${desafioEditando.id_desafio}`
      : API_DESAFIOS;

    const method = desafioEditando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    fecharModal();
    carregarDesafios();
  }

  async function publicarDesafio(id) {
    const res = await fetch(`${API_DESAFIOS}/${id}/publish`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    carregarDesafios();
  }

  async function meterRascunho(id) {
    const res = await fetch(`${API_DESAFIOS}/${id}/unpublish`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    carregarDesafios();
  }

  async function concluirDesafio(id) {
    const res = await fetch(`${API_DESAFIOS}/${id}/complete`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    carregarDesafios();
  }

  async function eliminarDesafio(id) {
    const res = await fetch(`${API_DESAFIOS}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    carregarDesafios();
  }

  function abrirCriar() {
    setDesafioEditando(null);
    setForm({
      titulo: "",
      data_inicio: "",
      data_fim: "",
      badge: "",
      notificar: false,
      publicado: false,
    });
    setModalAberto(true);
  }

  function abrirEditar(desafio) {
    setDesafioEditando(desafio);
    setForm({
      titulo: desafio.titulo,
      data_inicio: desafio.data_inicio?.slice(0, 16),
      data_fim: desafio.data_fim?.slice(0, 16),
      badge: desafio.badge,
      notificar: desafio.notificar,
      publicado: desafio.publicado,
    });
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setDesafioEditando(null);
  }

  useEffect(() => {
    carregarDesafios();
  }, []);

  const desafiosAtivos = desafios.filter((d) => d.publicado && !d.concluido);
  const desafiosRascunho = desafios.filter((d) => !d.publicado && !d.concluido);
  const desafiosTerminados = desafios.filter((d) => d.concluido);

  return (
    <div className="pagina-desafios-admin">

      <div className="pagina-admin">
        <header className="cartao-topo">

          <div className="linha-data">
            <span className="etiqueta-hoje"> 📅 Today</span>
            <strong> Qui, 23 de Abril</strong>
          </div>
          <button className="botao-criar-desafio" onClick={abrirCriar}>+ Criar desafio</button>
        </header>

        <section className="cabecalho-tarefas">
          <div>
            <h1>Gestão de Desafios</h1>
            <p>Bem-vindo de volta · Qui, 23 de Abril</p>
          </div>
        </section>
      </div>

      <main>
        <div className="grelha-estatisticas-desafios">
          <div className="cartao-estatistica-desafio">
            <div className="rotulo-estatistica-desafio"> ATIVOS</div>
            <div className="valor-estatistica-desafio">{desafiosAtivos.length}</div>
            <div className="texto-estatistica-desafio">publicados</div>
          </div>

          <div className="cartao-estatistica-desafio">
            <div className="rotulo-estatistica-desafio">RASCUNHOS</div>
            <div className="valor-estatistica-desafio">{desafiosRascunho.length}</div>
            <div className="texto-estatistica-desafio">ainda não publicados</div>
          </div>

          <div className="cartao-estatistica-desafio">
            <div className="rotulo-estatistica-desafio">TERMINADOS</div>
            <div className="valor-estatistica-desafio">{desafiosTerminados.length}</div>
            <div className="texto-estatistica-desafio">concluídos</div>
          </div>

        </div>
        {desafiosAtivos.length > 0 ? (
          <div className="lista-desafios-destaque">
            {desafiosAtivos.map((desafio) => (
              <section key={desafio.id_desafio} className="desafio-destaque">
                <div className="topo-desafio-destaque">
                  <div>
                    <div className="rotulo-desafio-destaque">PUBLICADO</div>
                  </div>
                  <span className="etiqueta-admin-desafio">ADMIN</span>
                </div>

                <h2 className="titulo-desafio-destaque">{desafio.titulo}</h2>
                <p className="descricao-desafio-destaque">Badge: {desafio.badge}</p>
                <div className="etiquetas-desafio">
                  <span className="etiqueta-desafio">{desafio.participacoes?.length || 0}{" "}participantes</span>
                  <span className="etiqueta-desafio"> Medalha: {desafio.badge}</span>
                </div>

                <div className="desafio-acoes-admin">
                  <button onClick={() => abrirEditar(desafio)}>Editar</button>
                  <button onClick={() => meterRascunho(desafio.id_desafio)}>Rascunho</button>
                  <button onClick={() => concluirDesafio(desafio.id_desafio)}>Concluir</button>
                  <button onClick={() => eliminarDesafio(desafio.id_desafio)}>Eliminar</button>
                </div>
              </section>
            ))}
          </div>
        ) : (

          <div className="estado-vazio-desafios">
            <h3>Sem nenhum desafio ativo.</h3>
          </div>

        )}

        <div className="grelha-listas-desafios">
          <section className="cartao-lista-desafios">
            <div className="cabecalho-cartao-desafios">
              <h3>Rascunhos</h3>
              <span> {desafiosRascunho.length} </span>
            </div>

            <div className="lista-desafios">
              {desafiosRascunho.map((desafio) => (
                <div key={desafio.id_desafio} className="item-lista-desafio">
                  <div>
                    <div className="titulo-item-desafio">{desafio.titulo} </div>
                    <p className="descricao-item-desafio">Badge: {desafio.badge}</p>
                  </div>

                  <div className="desafio-acoes-admin">
                    <button onClick={() =>abrirEditar(desafio)} >Editar </button>
                    <button onClick={() =>publicarDesafio(desafio.id_desafio)}>Publicar</button>
                    <button onClick={() =>concluirDesafio(desafio.id_desafio)}>Concluir</button>
                    <button onClick={() =>eliminarDesafio(desafio.id_desafio)}>Eliminar</button>
                  </div>

                </div>
              ))}
            </div>
          </section>

          <section className="cartao-lista-desafios">
            <div className="cabecalho-cartao-desafios">
              <h3>Histórico</h3>
              <span>{desafiosTerminados.length}</span>
            </div>
            {desafiosTerminados.length === 0 ? (
              <div className="historico-vazio">
                <p>Ainda não há desafios concluídos. </p>
              </div>
            ) : (
              <div className="lista-historico-desafios">
                {desafiosTerminados.map((desafio) => (
                  <div key={desafio.id_desafio} className="item-historico-desafio">

                    <div>
                      <div className="titulo-item-historico">{desafio.titulo}</div>
                      <p className="descricao-item-desafio">Badge: {desafio.badge}</p>
                    </div>

                    <div className="desafio-acoes-admin">
                      <span className="estado-historico">Concluído</span>
                      <button onClick={() =>abrirEditar(desafio)}>Editar</button>
                      <button onClick={() =>publicarDesafio(desafio.id_desafio)}>Publicar outra vez</button>
                      <button onClick={() =>eliminarDesafio(desafio.id_desafio)}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {modalAberto && (
        <div className="fundo-modal-desafios">
          <div className="modal-desafio">
            <div className="cabecalho-modal-desafio">
              <h2>
                {desafioEditando
                  ? "Editar desafio"
                  : "Criar desafio"}
              </h2>
              <button className="botao-fechar-modal"  onClick={fecharModal}>X</button>

            </div>

            <div className="campo-formulario-desafio">
              <label>Título</label>
              <input
                value={form.titulo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    titulo: e.target.value,
                  })
                }
              />
            </div>

            <div className="campo-formulario-desafio">
              <label>Data início</label>
              <input
                type="date"
                value={form.data_inicio}
                onChange={(e) =>
                  setForm({
                    ...form,
                    data_inicio: e.target.value,
                  })
                }
              />
            </div>

            <div className="campo-formulario-desafio">
              <label>Data fim</label>
              <input
                type="date"
                value={form.data_fim}
                onChange={(e) =>
                  setForm({
                    ...form,
                    data_fim: e.target.value,
                  })
                }
              />
            </div>

            <div className="campo-formulario-desafio">
              <label>Badge / Medalha</label>
              <input  value={form.badge} onChange={(e) =>
                  setForm({
                    ...form,
                    badge: e.target.value,
                  })
                }
              />
            </div>

            <div className="campo-formulario-desafio">
              <label>Estado</label>
              <select value={
                  form.publicado
                    ? "publicado"
                    : "rascunho"
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    publicado:
                      e.target.value === "publicado",
                  })
                }
              >
                <option value="rascunho"> Rascunho</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>

            <div className="campo-formulario-desafio">
              <label>
                <input
                  type="checkbox"
                  checked={form.notificar}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notificar: e.target.checked,
                    })
                  }
                />Notificar utilizadores
              </label>
            </div>

            <div className="acoes-modal-desafio">
              <button className="botao-cancelar-modal" onClick={fecharModal}>Cancelar</button>
              <button className="botao-guardar-modal" onClick={criarOuEditarDesafio}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}