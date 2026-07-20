import { useEffect, useState } from "react";
import "../css/report.css";

function Reports() {
  // Guarda todos os reports vindos da API
  const [reports, setReports] = useState([]);
  // Guarda mensagens de erro
  const [erro, setErro] = useState("");
  // URL da API de reports
  const API_URL = "http://localhost:3000/api/reports";
  const token = localStorage.getItem("token");


  /**
   * Carrega todos os reports do backend
   * GET /api/reports
  */
  async function carregarReports() {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Converte resposta para JSON
    const data = await res.json();
    // Guarda reports no estado
    setReports(data);
  }



  /**
   * Marca um report como resolvido
   * PATCH /api/reports/:id/resolve
  */
  async function resolverReport(id) {
    await fetch(`${API_URL}/${id}/resolve`, {
      method: "PATCH",
      headers: {Authorization: `Bearer ${token}`,}
    });
    // Atualiza lista depois da alteração
    carregarReports();
  }



  /**
   * Suspende o utilizador reportado   PATCH /api/reports/:id/suspend
  */
  async function suspenderUtilizador(id) {
    await fetch(`${API_URL}/${id}/suspend`, {
      method: "PATCH",
      headers: {Authorization: `Bearer ${token}`,},
    });
    // Atualiza lista depois da alteração
    carregarReports();
  }



  /**
   * Elimina a tarefa associada ao report   DELETE /api/reports/:id/task
  */
  async function apagarTarefaReportada(id) {
    await fetch(`${API_URL}/${id}/task`, {
      method: "DELETE",
      headers: {Authorization: `Bearer ${token}`,},
    });
    // Atualiza lista depois da alteração
    carregarReports();
  }
  
  //Carrega os reports logo ao entrar na página
  useEffect(() => {
    carregarReports();
  }, []);

  //pagina web
  return (
    <div className="reports-page">

      {/* Título da página */}
      <h1>Reports</h1>

      {/* Caso não existam reports */}
      {reports.length === 0 ? (
        <p>Não existem report.</p>
      ) : (
        // Lista de reports
        <div className="reports-list">
          {reports.map((report) => (
            <div key={report.id_report} className="report-card">
              {/* ID do report */}
              <h3>Report #{report.id_report}</h3>

              {/* Dados do report */}
              <p>Tipo: {report.tipo}</p>
              <p>Status: {report.status}</p>
              <p>Relevância: {report.relevancia}</p>
              <p> Reportado por: {report.reportadoPor?.nome}</p>
              <p>Utilizador reportado: {report.reportado?.nome}</p>


              {/* Caso o report tenha uma tarefa associada */}
              {report.tarefa && (
                <div className="report-task">
                  <strong>Tarefa reportada:</strong>
                  <p>{report.tarefa.title}</p>
                  <small>{report.tarefa.description}</small>
                </div>
              )}


              {/* Botões de ações */}
              <div className="report-actions">
                {/* Resolver report */}
                <button onClick={() => resolverReport(report.id_report)}>Resolver</button>

                {/* Suspender utilizador */}
                <button onClick={() => suspenderUtilizador(report.id_report)}>Suspender user</button>

                {/* Só aparece se existir tarefa */}
                {report.id_tarefa && (
                  <button onClick={() => apagarTarefaReportada(report.id_report)}>Apagar tarefa</button>

                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Reports;