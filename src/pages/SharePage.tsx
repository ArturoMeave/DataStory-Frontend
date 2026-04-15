import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShareBanner } from "../components/layout/ShareBanner";
import { useDataStore } from "../stores/dataStore";
import { getSharedSnapshot } from "../services/api.service";
import { AISummary } from "../components/dashboard/AISummary";
import { Loader2 } from "lucide-react";

export function SharePage() {
  const { id } = useParams<{ id: string }>();
  const { setIsReadOnly, setRows, setAiSummary, resetData } = useDataStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsReadOnly(true);

    const loadData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await getSharedSnapshot(id);

        setRows(data.recentPeriods || []);
        if (data.aiSummary) setAiSummary(data.aiSummary);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el análisis compartido.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      setIsReadOnly(false);
      resetData();
    };
  }, [id, setIsReadOnly, setRows, setAiSummary, resetData]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ShareBanner />
      <main
        style={{
          maxWidth: 1280,
          width: "100%",
          margin: "0 auto",
          padding: "40px 24px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Análisis Dinámico
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            Reporte financiero en modo de solo lectura.
          </p>
        </div>

        {isLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Loader2
              size={32}
              className="animate-spin"
              color="var(--color-accent)"
            />
          </div>
        ) : error ? (
          <div
            style={{
              background: "var(--color-danger-dim)",
              border: "1px solid rgba(244,63,94,0.2)",
              padding: 20,
              borderRadius: "var(--radius-md)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: 24,
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            ></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <AISummary />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
