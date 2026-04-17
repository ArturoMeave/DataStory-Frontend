import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import {
  FileText,
  ExternalLink,
  Loader2,
  Trash2,
  FileDown,
} from "lucide-react";
import { BASE_URL } from "../../services/api.service";

export function SnapshotsHistory() {
  const { token } = useAuthStore();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/snapshots/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSnapshots(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este informe?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/snapshots/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setSnapshots((prev) => prev.filter((snap) => snap.id !== id));
      } else {
        alert("Hubo un error al eliminar.");
      }
    } catch (error) {
      console.error("Error al eliminar snapshot:", error);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        animation: "fadeSlideUp 0.4s ease-out",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--color-text-primary)",
          }}
        >
          Registro de Informes
        </h2>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Historial de snapshots de tus datos guardados.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        {snapshots.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-muted)",
              padding: 40,
            }}
          >
            No hay informes.
          </p>
        ) : (
          snapshots.map((snap) => (
            <div
              key={snap.id}
              style={{
                background: "var(--color-bg-card)",
                padding: 20,
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    background: "rgba(124, 106, 255, 0.1)",
                    padding: 10,
                    borderRadius: 8,
                    color: "var(--color-accent)",
                  }}
                >
                  <FileText size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, margin: 0 }}>
                    Snapshot -{" "}
                    {new Date(
                      snap.createdAt || Date.now(),
                    ).toLocaleDateString()}
                  </h4>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    Ingresos: {snap.totalRevenue}€ | Beneficio: {snap.netProfit}
                    €
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() =>
                    window.open(
                      `http://localhost:5173/share/${snap.id}`,
                      "_blank",
                    )
                  }
                  style={{
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "var(--color-text-primary)",
                  }}
                  title="Ver Informe"
                >
                  <ExternalLink size={14} />
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `http://localhost:5173/share/${snap.id}?download=true`,
                      "_blank",
                    )
                  }
                  style={{
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "var(--color-accent)",
                  }}
                  title="Descargar PDF"
                >
                  <FileDown size={14} />
                </button>

                <button
                  onClick={() => handleDelete(snap.id)}
                  style={{
                    background: "rgba(244, 63, 94, 0.1)",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                    padding: "8px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "var(--color-danger)",
                  }}
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
