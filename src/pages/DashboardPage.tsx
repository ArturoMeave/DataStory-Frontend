import { useEffect } from "react";
import { Navbar } from "../components/layout/Navbar";
import { FileDropzone } from "../components/dashboard/FileDropzone";
import { GoalThermometer } from "../components/dashboard/GoalThermometer";
import { AISummary } from "../components/dashboard/AISummary";
import { RevenueLineChart } from "../components/charts/RevenueLinearChart";
import { ExpenseBarChart } from "../components/charts/ExpenseBarChart";
import { Card } from "../components/ui/Card";
import { useDataStore } from "../stores/dataStore";
import { detectAnomalies } from "../utils/anomalyDetector";
import {
  buildDataSummary,
  totalRevenue,
  totalExpenses,
  netProfit,
  formatCurrency,
} from "../utils/dataAggregator";
import { generateSummary } from "../services/api.service";
import { TaskPanel } from "../components/dashboard/TaskPanel";
import { ChatPanel } from "../components/dashboard/ChatPanel";
import { AnomalyAlert } from "../components/dashboard/AnomalyAlert";

export function DashboardPage() {
  const { rows, goal, setAnomalies, setAiSummary, setIsLoadingAI } =
    useDataStore();

  const hasData = rows.length > 0;
  const rev = totalRevenue(rows);
  const exp = totalExpenses(rows);
  const profit = netProfit(rows);

  // Cada vez que cambian los datos o la meta, detectamos anomalías y pedimos análisis a la IA
  useEffect(() => {
    if (!hasData) return;

    setAnomalies(detectAnomalies(rows));

    const fetchSummary = async () => {
      setIsLoadingAI(true);
      try {
        const summary = buildDataSummary(rows, goal?.amount);
        const text = await generateSummary(summary);
        setAiSummary(text);
      } catch {
        setAiSummary(
          "No se pudo conectar con el servidor. Asegúrate de que el backend está corriendo.",
        );
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchSummary();
  }, [rows, goal]);

  const handleRefreshAI = async () => {
    if (!hasData) return;
    setIsLoadingAI(true);
    try {
      const summary = buildDataSummary(rows, goal?.amount);
      const text = await generateSummary(summary);
      setAiSummary(text);
    } catch {
      setAiSummary("Error al conectar con el servidor.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <Navbar />
      {!hasData ? (
        <FileDropzone />
      ) : (
        <main
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* KPIs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            <Card>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Ingresos totales
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--color-success)",
                }}
              >
                {formatCurrency(rev)}
              </p>
            </Card>
            <Card>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Gastos totales
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--color-danger)",
                }}
              >
                {formatCurrency(exp)}
              </p>
            </Card>
            <Card>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-text-muted)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Beneficio neto
              </p>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color:
                    profit >= 0
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                }}
              >
                {formatCurrency(profit)}
              </p>
            </Card>
          </div>

          {/* Grid principal: gráficos + sidebar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: 20,
            }}
          >
            {/* Columna izquierda */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <AnomalyAlert />
              <GoalThermometer />
              <RevenueLineChart />
              <ExpenseBarChart />
              <AISummary onRefresh={handleRefreshAI} />
            </div>

            {/* Columna derecha */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <TaskPanel />
              <ChatPanel />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
