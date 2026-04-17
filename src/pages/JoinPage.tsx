import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { validateInvitation, acceptInvitation } from "../services/api.service";
import { useAuthStore } from "../stores/authStore";

export function JoinPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, updateUser } = useAuthStore();
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requiresForce, setRequiresForce] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!code) return;
    validateInvitation(code)
      .then((data: any) => setWorkspaceName(data.workspaceName))
      .catch((err: any) => setError(err.message || "La invitación no es válida o ha expirado."))
      .finally(() => setIsLoading(false));
  }, [code]);

  const handleAccept = async (force: boolean = false) => {
    if (!isAuthenticated) {
      // Redirigir a registro con invite code explícito
      navigate(`/auth?invite=${code}&mode=register`);
      return;
    }
    setIsAccepting(true);
    try {
      const user: any = await acceptInvitation(code!, force);
      updateUser({ role: user.role, workspaceId: user.workspaceId } as any);
      navigate("/dashboard");
    } catch (err: any) {
      if (err.message && err.message.includes("perderás el acceso")) {
        setRequiresForce(true);
        setError("Alerta de Sobreescritura");
      } else {
        setError(err.message || "Ha ocurrido un error al unirte al espacio de trabajo.");
      }
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-base)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background decoration elements */}
      <div style={{
        position: "absolute", top: "-10%", left: "-10%", width: "50%", height: "50%",
        background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)", opacity: 0.05, filter: "blur(80px)", zIndex: 0
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-10%", width: "50%", height: "50%",
        background: "radial-gradient(circle, #7c6aff 0%, transparent 70%)", opacity: 0.05, filter: "blur(80px)", zIndex: 0
      }} />

      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 24,
          padding: "48px 40px",
          textAlign: "center",
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          position: "relative",
          zIndex: 1,
          animation: "fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: 20, 
            background: "linear-gradient(135deg, rgba(149,191,71,0.2) 0%, rgba(124,106,255,0.2) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(149,191,71,0.3)"
          }}>
            <Building2 size={40} color="var(--color-accent)" />
          </div>
        </div>

        {isLoading ? (
          <div>
            <div style={{ display: "inline-block", width: 32, height: 32, border: "3px solid var(--color-border)", borderTopColor: "var(--color-accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: 24, color: "var(--color-text-secondary)", fontSize: 16 }}>Validando credenciales de acceso...</p>
          </div>
        ) : error ? (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ background: "rgba(239, 68, 68, 0.1)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <AlertCircle size={48} color="var(--color-danger)" style={{ margin: "0 auto 16px" }} />
              <h2 style={{ margin: "0 0 8px 0", fontSize: 24, color: "var(--color-text-primary)" }}>Acceso Denegado</h2>
              <p style={{ margin: 0, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{error}</p>
            </div>
            <button
              onClick={() => navigate("/")}
              style={{ padding: "14px 24px", background: "transparent", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-text-secondary)", cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}
            >
              Volver al Inicio
            </button>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <h1 style={{ margin: "0 0 12px 0", fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Únete al Equipo
            </h1>
            <p style={{ margin: "0 0 32px 0", fontSize: 16, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              Has sido invitado a formar parte del espacio de trabajo analítico de <strong style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{workspaceName}</strong>.
            </p>

            {requiresForce && (
              <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.5 }}>
                  <strong>⚠️ Ya perteneces a un equipo corporativo remoto.</strong><br/>
                  Si te unes a este nuevo equipo, perderás el acceso a tus datos y configuraciones actuales de forma irreversible.<br/>
                  ¿Deseas abandonar tu entorno actual y unirte a <strong style={{color:"var(--color-accent)"}}>{workspaceName}</strong> de todas formas?
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button onClick={() => navigate("/dashboard")} style={{ flex: 1, padding: "10px", background: "var(--color-bg-base)", border: "1px solid var(--color-border)", borderRadius: 8, color: "var(--color-text-primary)", fontWeight: 600, cursor: "pointer" }}>Conservar mi Empresa</button>
                  <button onClick={() => handleAccept(true)} style={{ flex: 1, padding: "10px", background: "var(--color-danger)", border: "none", borderRadius: 8, color: "white", fontWeight: 600, cursor: "pointer" }}>Sí, deseo cambiar</button>
                </div>
              </div>
            )}
            
            {!requiresForce && (
              <div style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: "20px 24px", marginBottom: 32, textAlign: "left" }}>
                 <h4 style={{ margin: "0 0 16px 0", fontSize: 14, color: "var(--color-text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}> Beneficios Compartidos </h4>
                 <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}><CheckCircle2 size={18} color="var(--color-accent)"/> <span style={{ fontSize: 15, color: "var(--color-text-secondary)"}}>Acceso interactivo a Analíticas</span></div>
                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}><CheckCircle2 size={18} color="var(--color-accent)"/> <span style={{ fontSize: 15, color: "var(--color-text-secondary)"}}>Visualización de Reportes Históricos</span></div>
                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}><ShieldCheck size={18} color="var(--color-accent)"/> <span style={{ fontSize: 15, color: "var(--color-text-secondary)"}}>Permisos regulados de forma segura</span></div>
                 </div>
              </div>
            )}

            {!requiresForce && (
              <button
                onClick={() => handleAccept()}
              disabled={isAccepting}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: "linear-gradient(135deg, var(--color-accent) 0%, #7c6aff 100%)",
                border: "none",
                borderRadius: 12,
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                boxShadow: "0 8px 24px rgba(149, 191, 71, 0.3)",
                transition: "transform 0.2s, box-shadow 0.2s",
                opacity: isAccepting ? 0.8 : 1
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(149, 191, 71, 0.4)" }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(149, 191, 71, 0.3)" }}
            >
              {isAccepting ? "Procesando Ingreso..." : (
                <>
                  {isAuthenticated ? "Aceptar y Entrar al Dashboard" : "Identificarse para Continuar"}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            )}
            <p style={{ marginTop: 20, fontSize: 13, color: "var(--color-text-muted)" }}>Protegido por DataStory Security</p>
          </div>
        )}
      </div>
    </div>
  );
}
