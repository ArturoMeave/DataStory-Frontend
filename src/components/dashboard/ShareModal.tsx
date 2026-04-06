import { useState, useEffect } from "react";
import { Link2, Copy, Check, Info, Loader2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useDataStore } from "../../stores/dataStore";
import { useAuthStore } from "../../stores/authStore";
import { saveSnapshot } from "../../services/api.service";
import { totalRevenue, totalExpenses, netProfit } from "../../utils/dataAggregator";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const { user } = useAuthStore();
  const { rows, anomalies, goal, aiSummary } = useDataStore();

  const [shareId, setShareId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShareId(null);
      setIsLoading(false);
      return;
    }

    // Solo creamos el snapshot si no tenemos un ID ya
    if (isOpen && !shareId && !isLoading) {
      setIsLoading(true);
      const doSave = async () => {
        try {
          const rev = totalRevenue(rows);
          const exp = totalExpenses(rows);
          const profit = netProfit(rows);
          const recent = rows.slice(-6).map((r) => ({
            date: r.date,
            revenue: r.revenue,
            expenses: r.expenses,
          }));

          const res = await saveSnapshot({
            userId: user?.id || "anon",
            totalRevenue: rev,
            totalExpenses: exp,
            netProfit: profit,
            periodCount: rows.length,
            anomalyCount: anomalies.length,
            goalAmount: goal?.amount,
            aiSummary: aiSummary,
            recentPeriods: recent,
          });

          if (res.ok && res.id) {
            setShareId(res.id);
          }
        } catch (error) {
          console.error("Error saving snapshot:", error);
        } finally {
          setIsLoading(false);
        }
      };

      doSave();
    }
  }, [isOpen]);

  const shareUrl = shareId 
    ? `${window.location.origin}/share/${shareId}` 
    : "Generando enlace...";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Compartir dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Descripción */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--radius-md)",
              background: "var(--color-accent-dim)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Link2 size={18} color="var(--color-accent)" />
          </div>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              Enlace de solo lectura
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-secondary)",
                lineHeight: 1.6,
              }}
            >
              Cualquier persona con este enlace puede ver tus gráficos y
              análisis, pero no puede editar ni exportar.
            </p>
          </div>
        </div>

        {/* URL + botón copiar */}
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              fontSize: 12,
              color: shareId ? "var(--color-text-secondary)" : "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {shareUrl}
          </div>
          <Button variant="primary" size="sm" onClick={handleCopy} disabled={!shareId || isLoading}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>

        {/* Aviso */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "10px 14px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-warning-dim)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <Info
            size={13}
            color="var(--color-warning)"
            style={{ marginTop: 1, flexShrink: 0 }}
          />
          <p
            style={{
              fontSize: 12,
              color: "var(--color-warning)",
              lineHeight: 1.5,
            }}
          >
            El enlace carga la vista de solo lectura. La persistencia de datos
            se implementa con base de datos en una fase posterior.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
