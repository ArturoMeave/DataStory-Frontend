import { useState } from "react";
import { Link2, Copy, Check, Info } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateShareId(): string {
  return `ds-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [shareId] = useState(generateShareId);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/share/${shareId}`;

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
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {shareUrl}
          </div>
          <Button variant="primary" size="sm" onClick={handleCopy}>
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
