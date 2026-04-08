import { useEffect, useState } from "react";
import { Shield, User, Plus, AlertCircle } from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { useAuthStore } from "../stores/authStore";
import {
  getWorkspaceMembers,
  updateMemberRole,
  generateInvitation,
} from "../services/api.service";

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
}

export function TeamPage() {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      const data = await getWorkspaceMembers();
      setMembers(data as Member[]);
    } catch (err: any) {
      setError("No se pudo cargar el equipo.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    try {
      await updateMemberRole(targetUserId, newRole);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || "No tienes permisos.");
    }
  };

  const handleGenerateLink = async () => {
    setIsInviting(true);
    try {
      const res: any = await generateInvitation("EDITOR"); // Cast 'any' para evitar error TS
      const link = `${window.location.origin}/join/${res.code}`;
      setInviteLink(link);
    } catch (err: any) {
      alert(err.message || "Error al generar.");
    } finally {
      setIsInviting(false);
    }
  };

  // Usamos un cast temporal a 'any' para el rol del usuario actual
  const isAdmin =
    (user as any)?.role === "ADMIN" ||
    (user as any)?.role === "OWNER" ||
    !(user as any)?.role;

  return (
    <div
      style={{ display: "flex", height: "100vh", background: "transparent" }}
    >
      <Sidebar />
      <div
        style={{
          marginLeft: 260,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            padding: "20px 32px",
            borderBottom: "1px solid var(--color-border)",
            background: "rgba(10,10,15,0.4)",
            backdropFilter: "blur(12px)",
            zIndex: 20,
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Gestión de Equipo
          </h1>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Administra los accesos de tu empresa.
          </p>
        </header>

        <main style={{ padding: "28px 32px", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {isAdmin && (
              <SpotlightCard>
                <div
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Añadir trabajador
                    </h3>
                    <p
                      style={{ fontSize: 12, color: "var(--color-text-muted)" }}
                    >
                      Genera un enlace seguro de un solo uso.
                    </p>
                  </div>
                  {inviteLink ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 14px",
                        background: "var(--color-success-dim)",
                        border: "1px solid var(--color-success)",
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "var(--color-success)",
                          fontFamily: "monospace",
                        }}
                      >
                        {inviteLink}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(inviteLink);
                          alert("Copiado!");
                          setInviteLink(null);
                        }}
                        style={{
                          background: "var(--color-success)",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        COPIAR
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateLink}
                      disabled={isInviting}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: "var(--color-accent)",
                        border: "none",
                        color: "#fff",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={14} style={{ marginRight: 6 }} />{" "}
                      {isInviting ? "Generando..." : "Generar Enlace"}
                    </button>
                  )}
                </div>
              </SpotlightCard>
            )}

            <SpotlightCard>
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Miembros
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {members.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 24px",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "var(--color-bg-base)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <User size={18} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500 }}>
                          {member.name || "Sin nombre"}{" "}
                          {member.id === user?.id && (
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--color-accent)",
                                background: "var(--color-accent-dim)",
                                padding: "2px 6px",
                                borderRadius: 10,
                              }}
                            >
                              TÚ
                            </span>
                          )}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color:
                            member.role === "OWNER"
                              ? "var(--color-warning)"
                              : "var(--color-accent)",
                        }}
                      >
                        {member.role}
                      </span>
                      {isAdmin &&
                        member.id !== user?.id &&
                        member.role !== "OWNER" && (
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(member.id, e.target.value)
                            }
                            style={{
                              padding: "6px 10px",
                              background: "var(--color-bg-elevated)",
                              border: "1px solid var(--color-border-hover)",
                              borderRadius: 6,
                              color: "white",
                            }}
                          >
                            <option value="EDITOR">Trabajador</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>
        </main>
      </div>
    </div>
  );
}
