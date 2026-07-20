import { useEffect, useState } from "react";
import "../css/desafio.css";

export default function DesafioPage() {
  const [desafios, setDesafios] = useState([]);
  const [erro, setErro] = useState("");

  const API_DESAFIOS = "http://localhost:3000/api/challenges";
  const token = localStorage.getItem("token");

  const userGuardado = JSON.parse(localStorage.getItem("user"));
  const meuId = userGuardado?.id_utilizador;

  async function carregarDesafios() {
    const res = await fetch(API_DESAFIOS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setDesafios(data);
  }

  async function aderirDesafio(id) {
    const res = await fetch(`${API_DESAFIOS}/${id}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    carregarDesafios();
  }

  async function sairDesafio(id) {
    const res = await fetch(`${API_DESAFIOS}/${id}/leave`, {
      method: "DELETE",
      headers: {Authorization: `Bearer ${token}`,},
    });
    carregarDesafios();
  }

  async function concluirDesafio(id) {
    const res = await fetch(`${API_DESAFIOS}/${id}/progress`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        concluido: true,
      }),
    });
    carregarDesafios();
  }

  useEffect(() => {
    carregarDesafios();
  }, []);


  const desafiosPublicados = desafios.filter((d) => d.publicado && !d.concluido);
  const desafiosParticipados = desafios.filter((d) =>
    d.participacoes?.some((p) => p.id_user === meuId)
  );

  const desafiosHistorico = desafios.filter((d) =>
    d.participacoes?.some((p) => p.id_user === meuId && p.concluido)
  );

  const desafiosAtivos = desafiosPublicados.filter((d) =>
    !d.participacoes?.some((p) => p.id_user === meuId && p.concluido)
  );

  const desafioAtual = desafiosAtivos[0] || null;

  function userParticipa(desafio) {
    return desafio.participacoes?.some((p) => p.id_user === meuId);
  }

  function userConcluiu(desafio) {
    return desafio.participacoes?.some(
      (p) => p.id_user === meuId && p.concluido
    );
  }

  function diasRestantes(dataFim) {
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diff = fim - hoje;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const renderizarAcoesUser = (desafio) => {
    const participa = userParticipa(desafio);
    const concluiu = userConcluiu(desafio);

    if (concluiu) {
      return <span className="estado-desafio-feito">Concluído</span>;
    }

    return (
      <div className="desafio-acoes-user">
        {participa ? (
          <>
            <button onClick={() => concluirDesafio(desafio.id_desafio)}>Concluir</button>
            <button onClick={() => sairDesafio(desafio.id_desafio)}>Sair</button>
          </>
        ) : (
          <button onClick={() => aderirDesafio(desafio.id_desafio)}>Participar</button>
        )}
      </div>
    );
  };

  return (
    <div className="pagina-desafios-user">
      <div className="pagina-user">
        <header className="cartao-topo">
          <div className="linha-data">
            <span className="etiqueta-hoje">📅 Today</span>
            <strong>Desafios</strong>
          </div>
        </header>

        <section className="cabecalho-tarefas">
          <div>
            <h1>Desafios</h1>
            <p>Participa em desafios e acompanha o teu progresso.</p>
          </div>
        </section>
      </div>
      <main>
        <div className="grelha-estatisticas-desafios">
          <div className="cartao-estatistica-desafio">
            <div className="rotulo-estatistica-desafio">ATIVOS</div>
            <div className="valor-estatistica-desafio">{desafiosAtivos.length}</div>
            <div className="texto-estatistica-desafio">disponíveis</div>
          </div>

          <div className="cartao-estatistica-desafio">
            <div className="rotulo-estatistica-desafio">PARTICIPADOS</div>
            <div className="valor-estatistica-desafio">{desafiosParticipados.length}</div>
            <div className="texto-estatistica-desafio">em que entraste</div>
          </div>

          <div className="cartao-estatistica-desafio">
            <div className="rotulo-estatistica-desafio">CONCLUÍDOS</div>
            <div className="valor-estatistica-desafio">{desafiosHistorico.length}</div>
            <div className="texto-estatistica-desafio">finalizados</div>
          </div>
        </div>

        {desafioAtual ? (
          <section className="desafio-destaque-user">
            <h2 className="titulo-desafio-destaque">{desafioAtual.titulo}</h2>

            <p className="descricao-desafio-destaque"> Badge: {desafioAtual.badge}</p>

            <div className="etiquetas-desafio">
              <span className="etiqueta-desafio">{desafioAtual.participacoes?.length || 0} participantes </span>
              <span className="etiqueta-desafio">{diasRestantes(desafioAtual.data_fim)} dias restantes</span>
              <span className="etiqueta-desafio">Medalha: {desafioAtual.badge}</span>
            </div>
            {renderizarAcoesUser(desafioAtual)}
          </section>

        ) : (
          <div className="estado-vazio-desafios">
            <h3>Sem desafios ativos</h3>
          </div>
        )}

        <div className="grelha-listas-desafios">
          <section className="cartao-lista-desafios">
            <div className="cabecalho-cartao-desafios">
              <h3>Desafios disponíveis</h3>
              <span>{desafiosAtivos.length}</span>
            </div>

            <div className="lista-desafios">
              {desafiosAtivos.map((desafio) => (
                <div key={desafio.id_desafio} className="item-lista-desafio">
                  <div>
                    <div className="titulo-item-desafio">
                      {desafio.titulo}
                    </div>

                    <p className="descricao-item-desafio">Badge: {desafio.badge}</p>
                  </div>

                  {renderizarAcoesUser(desafio)}
                </div>
              ))}
            </div>
          </section>

          <section className="cartao-lista-desafios">
            <div className="cabecalho-cartao-desafios">
              <h3>Histórico</h3>
              <span>{desafiosHistorico.length}</span>
            </div>

            {desafiosHistorico.length === 0 ? (
              <div className="historico-vazio">
                <p>Ainda não concluíste desafios.</p>
              </div>
            ) : (
              <div className="lista-historico-desafios">
                {desafiosHistorico.map((desafio) => (
                  <div key={desafio.id_desafio} className="item-historico-desafio">
                    <div>
                      <div className="titulo-item-historico">
                        {desafio.titulo}
                      </div>
                      <p className="descricao-item-desafio"> Badge: {desafio.badge}</p>
                    </div>

                    <span className="estado-desafio-feito">Concluído</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}