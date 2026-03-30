import { useState } from "react";
import {
  Key,
  Info,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { fetchStripeData } from "../../services/stripe.service";
import { useDataStore } from "../../stores/dataStore";

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StripeModal({ isOpen, onClose }: StripeModalProps) {
  const { setRows } = useDataStore();
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchStripeData(apiKey.trim());
      setRows(data);
      onClose();
    } catch (err: any) {
      setError(
        err.message || "Error al conectar con Stripe. Verifica tu API Key.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Conectar con Stripe">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: "4px 0",
        }}
      >
        {/* Header/Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-accent-dim)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Info size={16} color="var(--color-accent)" />
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              Importar datos de ventas
            </h3>
          </div>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Copia tu <strong>Restricted Key</strong> o{" "}
            <strong>Secret Key</strong> desde tu panel de Stripe para analizar
            tus ingresos de los últimos 90 días.
          </p>
        </div>

        {/* API Key Input Form */}
        <form
          onSubmit={handleImport}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Stripe API Key
            </label>
            <div style={{ position: "relative" }}>
              <Key
                size={16}
                color="var(--color-text-tertiary)"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_live_..."
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 40px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-text-tertiary)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexWrap: "wrap",
              }}
            >
              <span>¿No sabes dónde encontrarla?</span>
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-accent)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  fontWeight: 500,
                }}
              >
                Ir a Stripe <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                background: "var(--color-error-dim)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(239, 68, 68, 0.1)",
              }}
            >
              <AlertCircle size={16} color="var(--color-error)" />
              <span style={{ fontSize: 13, color: "var(--color-error)" }}>
                {error}
              </span>
            </div>
          )}

          {/* Security Note */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: "var(--color-bg-alt)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          >
            <ShieldCheck size={16} color="var(--color-text-secondary)" />
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              Tu clave se usa solo para esta sesión y nunca se almacena en
              nuestros servidores.
            </p>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 8,
            }}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!apiKey.trim() || isLoading}
            >
              {isLoading ? "Conectando..." : "Importar Datos"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
