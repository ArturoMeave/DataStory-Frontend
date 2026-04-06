import { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { User, Building, ShieldCheck, Shield, AlertCircle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { generate2FA, enable2FA } from "../services/api.service";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "workspace">("profile");
  const { user } = useAuthStore();

  // Estados para 2FA
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [is2FASetupVisible, setIs2FASetupVisible] = useState(false);
  const [error2FA, setError2FA] = useState<string | null>(null);
  const [success2FA, setSuccess2FA] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate2FA = async () => {
    try {
      setIsLoading(true);
      setError2FA(null);
      const res = await generate2FA();
      setQrCode(res.qrCodeDataUrl);
      setIs2FASetupVisible(true);
    } catch (err) {
      setError2FA("Error al generar el código QR.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (twoFactorCode.length !== 6) {
      setError2FA("El código debe tener exactamente 6 dígitos.");
      return;
    }
    
    try {
      setIsLoading(true);
      setError2FA(null);
      await enable2FA(twoFactorCode);
      setSuccess2FA("¡Autenticación de 2 Pasos activada con éxito! Tu cuenta está protegida.");
      setQrCode(null); // Ocultamos el QR porque ya terminó
      setTwoFactorCode("");
    } catch (err) {
      setError2FA("El código es incorrecto o ha expirado.");
    } finally {
      setIsLoading(false);
    }
  };

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
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                  background: activeTab === "profile" ? "var(--color-accent-dim)" : "transparent",
                  border: "none", borderRadius: "var(--radius-md)",
                  color: activeTab === "profile" ? "var(--color-accent)" : "var(--color-text-secondary)",
                  cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.2s"
                }}
              >
                <User size={16} />
                Mi Perfil
              </button>
              <button
                onClick={() => setActiveTab("workspace")}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                  background: activeTab === "workspace" ? "var(--color-accent-dim)" : "transparent",
                  border: "none", borderRadius: "var(--radius-md)",
                  color: activeTab === "workspace" ? "var(--color-accent)" : "var(--color-text-secondary)",
                  cursor: "pointer", fontSize: 14, fontWeight: 500, transition: "all 0.2s"
                }}
              >
                <Building size={16} />
                Mi Empresa (Roles)
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                
                {/* Info Personal */}
                <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 16 }}>
                    Información Personal
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Nombre</label>
                      <input type="text" value={user?.name || ""} disabled style={{ padding: "10px 14px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "var(--color-text-secondary)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Correo Electrónico</label>
                      <input type="email" value={user?.email || ""} disabled style={{ padding: "10px 14px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", color: "var(--color-text-secondary)" }} />
                    </div>
                  </div>
                </div>

                {/* Sección de Seguridad 2FA */}
                <div style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Shield size={18} color="var(--color-accent)" />
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>
                      Seguridad y Autenticación
                    </h2>
                  </div>
                  
                  <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 20 }}>
                    Protege tu cuenta con la Autenticación de Dos Pasos (2FA). Te pediremos un código de tu app autenticadora cada vez que inicies sesión.
                  </p>

                  {success2FA ? (
                    <div style={{ background: "rgba(34,211,160,0.1)", border: "1px solid var(--color-success)", padding: 16, borderRadius: "var(--radius-md)", color: "var(--color-success)", fontSize: 14 }}>
                      {success2FA}
                    </div>
                  ) : !is2FASetupVisible ? (
                    <button
                      onClick={handleGenerate2FA}
                      disabled={isLoading}
                      style={{
                        padding: "10px 20px", background: "var(--color-accent)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 500, fontSize: 14
                      }}
                    >
                      {isLoading ? "Cargando..." : "Configurar 2FA"}
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, background: "var(--color-bg-elevated)", padding: 20, borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                      {qrCode && (
                        <div style={{ textAlign: "center" }}>
                          <p style={{ fontSize: 14, color: "var(--color-text-primary)", marginBottom: 12 }}>
                            1. Escanea este código QR con tu aplicación (Google Authenticator, Authy, etc).
                          </p>
                          <img src={qrCode} alt="2FA QR Code" style={{ border: "4px solid white", borderRadius: 8 }} />
                        </div>
                      )}

                      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 20 }}>
                        <p style={{ fontSize: 14, color: "var(--color-text-primary)", marginBottom: 12 }}>
                          2. Introduce el código de 6 dígitos que genera la app para confirmar.
                        </p>
                        <div style={{ display: "flex", gap: 12 }}>
                          <input
                            type="text"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder="Ej. 123456"
                            maxLength={6}
                            style={{ flex: 1, padding: "10px 14px", fontSize: 16, letterSpacing: "2px", textAlign: "center", borderRadius: "var(--radius-md)", background: "var(--color-bg-base)", border: "1px solid var(--color-border-hover)", color: "var(--color-text-primary)", outline: "none" }}
                          />
                          <button
                            onClick={handleEnable2FA}
                            disabled={isLoading || twoFactorCode.length !== 6}
                            style={{
                              padding: "0 20px", background: "var(--color-accent)", color: "white", border: "none", borderRadius: "var(--radius-md)", cursor: twoFactorCode.length === 6 ? "pointer" : "not-allowed", fontWeight: 500, opacity: twoFactorCode.length === 6 ? 1 : 0.5
                            }}
                          >
                            Verificar y Activar
                          </button>
                        </div>
                      </div>

                      {error2FA && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: "var(--radius-md)", background: "var(--color-danger-dim)", color: "var(--color-danger)", fontSize: 13, border: "1px solid var(--color-danger)" }}>
                          <AlertCircle size={14} /> {error2FA}
                        </div>
                      )}
                    </div>
                  )}
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
