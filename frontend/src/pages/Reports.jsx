import { useEffect, useState } from "react";
import "../css/report.css";

function Reports() {
  const [reports, setReports] = useState([]);
  const [erro, setErro] = useState("");
  const [aCarregar, setACarregar] = useState(true);

  const BASE_API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000";

  const API_REPORTS = `${BASE_API_URL}/api/reports`;

  const token = localStorage.getItem("token");

  async function carregarReports() {
    try {
      setACarregar(true);
      setErro("");

      const res = await fetch(API_REPORTS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(
          data.error ||
          "Não foi possível carregar os reports.",
        );
        setReports([]);
        return;
      }

      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar reports:", error);

      setErro(
        "Não foi possível comunicar com o servidor.",
      );

      setReports([]);
    } finally {
      setACarregar(false);
    }
  }

  async function resolverReport(id) {
    try {
      setErro("");

      const res = await fetch(
        `${API_REPORTS}/${id}/resolve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(
          data.error ||
          "Não foi possível resolver o report.",
        );
        return;
      }

      await carregarReports();
    } catch (error) {
      console.error("Erro ao resolver report:", error);

      setErro(
        "Não foi possível comunicar com o servidor.",
      );
    }
  }

  async function suspenderUtilizador(id) {
    try {
      setErro("");

      const res = await fetch(
        `${API_REPORTS}/${id}/suspend`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(
          data.error ||
          "Não foi possível suspender o utilizador.",
        );
        return;
      }

      await carregarReports();
    } catch (error) {
      console.error(
        "Erro ao suspender utilizador:",
        error,
      );

      setErro(
        "Não foi possível comunicar com o servidor.",
      );
    }
  }

  async function apagarTarefaReportada(id) {
    const confirmar = window.confirm(
      "Tens a certeza de que queres apagar esta tarefa?",
    );

    if (!confirmar) return;

    try {
      setErro("");

      const res = await fetch(
        `${API_REPORTS}/${id}/task`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(
          data.error ||
          "Não foi possível apagar a tarefa.",
        );
        return;
      }

      await carregarReports();
    } catch (error) {
      console.error(
        "Erro ao apagar tarefa reportada:",
        error,
      );

      setErro(
        "Não foi possível comunicar com o servidor.",
      );
    }
  }

  useEffect(() => {
    carregarReports();
  }, []);

  return (
    <div className="reports-page">
      <h1>Reports</h1>

      {erro && (
        <p className="reports-error">
          {erro}
        </p>
      )}

      {aCarregar ? (
        <p>A carregar reports...</p>
      ) : reports.length === 0 ? (
        <p>Não existem reports.</p>
      ) : (
        <div className="reports-list">
          {reports.map((report) => (
            <div
              key={report.id_report}
              className="report-card"
            >
              <h3>Report #{report.id_report}</h3>

              <p>
                <strong>Tipo:</strong> {report.tipo}
              </p>

              <p>
                <strong>Status:</strong> {report.status}
              </p>

              <p>
                <strong>Relevância:</strong>{" "}
                {report.relevancia}
              </p>

              <p>
                <strong>Reportado por:</strong>{" "}
                {report.reportadoPor?.nome ||
                  "Desconhecido"}
              </p>

              <p>
                <strong>Utilizador reportado:</strong>{" "}
                {report.reportado?.nome ||
                  "Desconhecido"}
              </p>

              {report.tarefa && (
                <div className="report-task">
                  <strong>Tarefa reportada:</strong>
                  <p>{report.tarefa.title}</p>
                  <small>
                    {report.tarefa.description ||
                      "Sem descrição."}
                  </small>
                </div>
              )}

              <div className="report-actions">
                <button
                  type="button"
                  onClick={() =>
                    resolverReport(report.id_report)
                  }
                >
                  Resolver
                </button>

                <button
                  type="button"
                  onClick={() =>
                    suspenderUtilizador(
                      report.id_report,
                    )
                  }
                >
                  Suspender user
                </button>

                {report.id_tarefa && (
                  <button
                    type="button"
                    onClick={() =>
                      apagarTarefaReportada(
                        report.id_report,
                      )
                    }
                  >
                    Apagar tarefa
                  </button>
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