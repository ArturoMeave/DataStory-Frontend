import { Sparkles, RefreshCw } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useDataStore } from "../../stores/dataStore";

interface AISummaryProps {
  onRefresh?: () => void;
}

function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      style={{
        height: 12,
        width,
        borderRadius: 6,
        background: "var(--color-bg-elevated)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export function AISummary({ onRefresh }: AISummaryProps) {
  const { aiSummary, isLoadingAI } = useDataStore();

  return (
    <Card
      glow={aiSummary ? "accent" : "none"}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color="var(--color-accent)" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Análisis inteligente
          </span>
        </div>
        {!isLoadingAI && aiSummary && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw size={12} />
            Actualizar
          </Button>
        )}
      </div>

      {/* Contenido */}
      {isLoadingAI ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SkeletonLine width="92%" />
          <SkeletonLine width="78%" />
          <SkeletonLine width="85%" />
          <SkeletonLine width="60%" />
        </div>
      ) : aiSummary ? (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
          }}
        >
          {aiSummary}
        </p>
      ) : (
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          El análisis aparecerá aquí una vez que se carguen los datos.
        </p>
      )}
    </Card>
  );
}
