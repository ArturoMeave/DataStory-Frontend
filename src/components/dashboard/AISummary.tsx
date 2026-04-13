import { Sparkles, AlertCircle } from "lucide-react";
import { SpotlightCard } from "../ui/SpotlightCard";
import { useDataStore } from "../../stores/dataStore";

export function AISummary() {
  // Leemos la memoria global
  const { aiSummary, isLoadingAI } = useDataStore();

  return (
    <SpotlightCard style={{ height: "100%" }}>
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "rgba(124, 58, 237, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={18} color="var(--color-accent)" />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Análisis de la IA
          </h3>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
          {isLoadingAI ? (
            <div
              style={{
                animation: "pulse 2s infinite",
                color: "var(--color-text-muted)",
                fontSize: 14,
              }}
            >
              Analizando tus finanzas...
            </div>
          ) : !aiSummary ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--color-text-muted)",
                fontSize: 14,
              }}
            >
              <AlertCircle size={16} /> Esperando datos para analizar.
            </div>
          ) : (
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-secondary)",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
              }}
            >
              {aiSummary}
            </p>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
