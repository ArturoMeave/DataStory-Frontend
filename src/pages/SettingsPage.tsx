import { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { User, Building, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "workspace">("profile");
  const { user } = useAuthStore();

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
            Ajustes
          </h1>
        </header>

        {/* Content */}
        <main style={{ padding: "28px 32px", flex: 1 }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            
            {/* Tabs System */}
            <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--color-border)", paddingBottom: 16, marginBottom: 24 }}>
              <button
                onClick={() => setActiveTab("profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background: activeTab === "profile" ? "var(--color-accent-dim)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: activeTab === "profile" ? "var(--color-accent)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "all 0.2s"
                }}
              >
                <User size={16} />
                Mi Perfil
              </button>
              <button
                onClick={() => setActiveTab("workspace")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background: activeTab === "workspace" ? "var(--color-accent-dim)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: activeTab === "workspace" ? "var(--color-accent)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "all 0.2s"
                }}
              >
                <Building size={16} />
                Mi Empresa (Roles)
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === "profile" && (
              <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 16 }}>
                  Información Personal
                </h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Nombre</label>
                    <input 
                      type="text" 
                      value={user?.name || ""} 
                      disabled 
                      style={{ padding: "10px 14px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "var(--color-text-secondary)" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Correo Electrónico</label>
                    <input 
                      type="email" 
                      value={user?.email || ""} 
                      disabled 
                      style={{ padding: "10px 14px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "var(--color-text-secondary)" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "workspace" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>
                       Workspace de la Empresa
                    </h2>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 10px", background: "rgba(34,211,160,0.1)", color: "var(--color-success)", borderRadius: 12 }}>
                      <ShieldCheck size={14} /> ADMINISTRADOR
                    </span>
                  </div>
                  
                  <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
                    Aquí podrás invitar a otros miembros a tu equipo y cambiar permisos. El servidor ya está preparado, muy pronto activaremos esta pantalla visualmente.
                  </p>

                  <div style={{ padding: "20px", background: "var(--color-bg-elevated)", border: "1px dashed var(--color-border)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Vista de Roles y Permisos en construcción...</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
