import { useEffect, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { getSnapshots } from "../services/api.service";
import { Loader2, ExternalLink } from "lucide-react";
import { formatCurrency } from "../utils/dataAggregator";
import { Link } from "react-router-dom";

export function HistoryPage() {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getSnapshots();
        setSnapshots(data);
      } catch (error) {
        console.error("Error fetching snapshots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-base)" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
        {/* Header */}
        <header
          style={{
            padding: "20px 32px",
            borderBottom: "1px solid var(--color-border)",
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
            Historial de Snapshots
          </h1>
        </header>

        {/* Contenido */}
        <main style={{ padding: "28px 32px", flex: 1 }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: "var(--color-text-secondary)" }}>
                Tus análisis guardados previamente
              </h2>
            </div>
            
            {isLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 size={24} className="animate-spin" color="var(--color-accent)" />
              </div>
            ) : snapshots.length === 0 ? (
              <div style={{ background: "var(--color-bg-card)", padding: 40, borderRadius: "var(--radius-lg)", textAlign: "center", border: "1px solid var(--color-border)" }}>
                <p style={{ color: "var(--color-text-muted)" }}>Aún no has guardado ningún análisis.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "var(--color-bg-card)",
                      border: "1px solid var(--color-border)",
                      padding: "16px 20px",
                      borderRadius: "var(--radius-lg)",
                      transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                        {new Date(snap.createdAt).toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                        <span style={{ fontSize: 14, color: "var(--color-success)" }}>
                          Ingresos: {formatCurrency(snap.totalRevenue || 0)}
                        </span>
                        <span style={{ fontSize: 14, color: "var(--color-danger)" }}>
                          Gastos: {formatCurrency(snap.totalExpenses || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/share/${snap.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 12px",
                        background: "var(--color-accent-dim)",
                        color: "var(--color-accent)",
                        borderRadius: "var(--radius-md)",
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      <ExternalLink size={14} />
                      Ver Dashboard
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
