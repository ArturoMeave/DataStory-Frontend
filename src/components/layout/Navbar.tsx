import {
  BarChart2,
  Download,
  Share2,
  Upload,
  RotateCcw,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/Button";
import { useDataStore } from "../../stores/dataStore";
import { useAuthStore } from "../../stores/authStore";

interface NavbarProps {
  onExportPDF?: () => void;
  onShare?: () => void;
  onUploadNew?: () => void;
}

export function Navbar({ onExportPDF, onShare, onUploadNew }: NavbarProps) {
  const { rows, isReadOnly, resetData } = useDataStore();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    resetData();
  };

  const hasData = rows.length > 0;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--radius-sm)",
              background: "var(--color-accent-dim)",
              border: "1px solid var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChart2 size={14} color="var(--color-accent)" />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            DataStory
          </span>
          {isReadOnly && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 20,
                background: "var(--color-warning-dim)",
                color: "var(--color-warning)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              Solo lectura
            </span>
          )}
        </div>

        {/* Lado derecho */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Acciones — solo visibles con datos y fuera del modo lectura */}
          {!isReadOnly && hasData && (
            <>
              <Button variant="ghost" size="sm" onClick={onUploadNew}>
                <Upload size={13} />
                Nuevo archivo
              </Button>
              <Button variant="ghost" size="sm" onClick={resetData}>
                <RotateCcw size={13} />
                Limpiar
              </Button>
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 size={13} />
                Compartir
              </Button>
              <Button variant="primary" size="sm" onClick={onExportPDF}>
                <Download size={13} />
                Exportar PDF
              </Button>

              {/* Separador */}
              <div
                style={{
                  width: 1,
                  height: 20,
                  background: "var(--color-border)",
                }}
              />
            </>
          )}

          {/* Usuario + logout — siempre visible si está autenticado */}
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {user.name ?? user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={13} />
                Salir
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
