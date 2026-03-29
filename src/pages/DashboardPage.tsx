import { Navbar } from "../components/layout/Navbar";
import { FileDropzone } from "../components/dashboard/FileDropzone";
import { RevenueLineChart } from "../components/charts/RevenueLinearChart";
import { ExpenseBarChart } from "../components/charts/ExpenseBarChart";
import { useDataStore } from "../stores/dataStore";
import { detectAnomalies } from "../utils/anomalyDetector";
import {
  totalRevenue,
  totalExpenses,
  netProfit,
  formatCurrency,
} from "../utils/dataAggregator";
import { Card } from "../components/ui/Card";
import { useEffect } from "react";

export function DashboardPage() {
  const { rows, setAnomalies } = useDataStore();
  const hasData = rows.length > 0;

  // Detectamos anomalías cada vez que cambian los datos
  useEffect(() => {
    if (rows.length > 0) {
      setAnomalies(detectAnomalies(rows));
    }
  }, [rows, setAnomalies]);

  const rev = totalRevenue(rows);
  const exp = totalExpenses(rows);
  const profit = netProfit(rows);

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

          {/* Gráficos */}
          <RevenueLineChart />
          <ExpenseBarChart />
        </main>
      )}
    </div>
  );
}
