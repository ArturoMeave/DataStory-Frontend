import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building, AlertCircle } from "lucide-react";
import { validateInvitation, acceptInvitation } from "../services/api.service";
import { useAuthStore } from "../stores/authStore";

export function JoinPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, updateUser } = useAuthStore();
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!code) return;
    validateInvitation(code)
      .then((data: any) => setWorkspaceName(data.workspaceName))
      .catch((err: any) => setError(err.message || "Enlace inválido."))
      .finally(() => setIsLoading(false));
  }, [code]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    setIsAccepting(true);
    try {
      const user: any = await acceptInvitation(code!);
      updateUser({ role: user.role, workspaceId: user.workspaceId } as any);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al unirte.");
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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
        }}
      >
        {isLoading ? (
          <p>Verificando...</p>
        ) : error ? (
          <div>
            <AlertCircle size={40} color="var(--color-danger)" />
            <p>{error}</p>
          </div>
        ) : (
          <div>
            <Building size={48} color="var(--color-accent)" />
            <h2>¡Te han invitado!</h2>
            <p>
              A unirte a <strong>{workspaceName}</strong>.
            </p>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              style={{
                width: "100%",
                padding: 12,
                background: "var(--color-accent)",
                border: "none",
                borderRadius: 8,
                color: "white",
                fontWeight: 600,
              }}
            >
              {isAccepting ? "Uniéndose..." : "Aceptar y Entrar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
