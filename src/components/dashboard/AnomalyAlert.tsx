import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useDataStore } from "../../stores/dataStore";
import { formatCurrency } from "../../utils/dataAggregator";

export function AnomalyAlert() {
  const { anomalies } = useDataStore();
  const [dismissed, setDismissed] = useState(false);

  // Si no hay anomalías o el usuario cerró el banner, no mostramos nada
  if (anomalies.length === 0 || dismissed) return null;

  const expenseAnomalies = anomalies.filter((a) => a.type === "expense");
  const revenueAnomalies = anomalies.filter((a) => a.type === "revenue");

  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        background: "var(--color-danger-dim)",
        border: "1px solid var(--color-danger)",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
      }}
    >
      <AlertTriangle
        size={15}
        color="var(--color-danger)"
        style={{ marginTop: 1, flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-danger)",
            marginBottom: 4,
          }}
        >
          {anomalies.length === 1
            ? "1 anomalía detectada en tus datos"
            : `${anomalies.length} anomalías detectadas en tus datos`}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          {expenseAnomalies.map((a) => (
            <p
              key={`exp-${a.index}`}
              style={{
                fontSize: 12,
                color: "var(--color-danger)",
                opacity: 0.8,
              }}
            >
              Gasto inusual el {a.date}: {formatCurrency(a.value)}
            </p>
          ))}
          {revenueAnomalies.map((a) => (
            <p
              key={`rev-${a.index}`}
              style={{
                fontSize: 12,
                color: "var(--color-danger)",
                opacity: 0.8,
              }}
            >
              Ingreso inusual el {a.date}: {formatCurrency(a.value)}
            </p>
          ))}
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 2,
          flexShrink: 0,
          opacity: 0.7,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.7";
        }}
      >
        <X size={14} color="var(--color-danger)" />
      </button>
    </div>
  );
}
