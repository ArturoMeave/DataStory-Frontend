import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { ShareBanner } from "../components/layout/ShareBanner";
import { useDataStore } from "../stores/dataStore";
import { getSharedSnapshot } from "../services/api.service";
import { detectAnomalies } from "../utils/anomalyDetector";
import { RevenueLineChart } from "../components/charts/RevenueLinearChart";
import { ExpenseBarChart } from "../components/charts/ExpenseBarChart";
import { AISummary } from "../components/dashboard/AISummary";
import { Loader2 } from "lucide-react";

export function SharePage() {
  const { id } = useParams<{ id: string }>();
  const { setIsReadOnly, setRows, setAnomalies, setAiSummary, resetData } = useDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Cuando el usuario entra al resumen compartido, forzamos ReadOnly
    setIsReadOnly(true);

    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await getSharedSnapshot(id);
        
        // Guardamos las filas temporalmente en nuestro archivador Zustand
        setRows(data.recentPeriods || []);
        
        // Calculamos las anomalías localmente para graficarlas
        setAnomalies(detectAnomalies(data.recentPeriods || []));
        
        // Si hay resumen, lo pegamos
        if (data.aiSummary) setAiSummary(data.aiSummary);

      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el análisis compartido.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Cuando el usuario se vaya de esta vista, reseteamos para no ensuciar su dashboard real
    return () => {
      setIsReadOnly(false);
      resetData();
    };
  }, [id, setIsReadOnly, setRows, setAnomalies, setAiSummary, resetData]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <ShareBanner />
      <main style={{ maxWidth: 1280, width: "100%", margin: "0 auto", padding: "40px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
        
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Análisis Dinámico
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            Reporte financiero en modo de solo lectura.
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <Loader2 size={32} className="animate-spin" color="var(--color-accent)" />
          </div>
        ) : error ? (
          <div style={{ background: "var(--color-danger-dim)", border: "1px solid rgba(244,63,94,0.2)", padding: 20, borderRadius: "var(--radius-md)", color: "var(--color-danger)" }}>
            {error}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                <ExpenseBarChart />
              </div>
              <RevenueLineChart />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <AISummary onRefresh={async () => {}} />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
