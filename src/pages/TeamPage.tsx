import { useEffect, useState } from "react";
import {
  User,
  Plus,
  Link,
  Copy,
  Check,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { useAuthStore } from "../stores/authStore";
import {
  getWorkspaceMembers,
  updateMemberRole,
  generateInvitation,
  acceptInvitation,
} from "../services/api.service";

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
}

export function TeamPage() {
  const { user, updateUser } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [isInviting, setIsInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [joinInput, setJoinInput] = useState("");
  const [isJoining, setIsJoining] = useState(false);

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
      const res: any = await generateInvitation("EDITOR");
      const link = `${window.location.origin}/join/${res.code}`;
      setInviteLink(link);
    } catch (err: any) {
      alert(err.message || "Error al generar.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setInviteLink(null);
      }, 2000);
    }
  };

  const handleJoinTeam = async () => {
    if (!joinInput.trim()) return;

    setIsJoining(true);
    try {
      const code = joinInput.split("/").pop()?.trim() || joinInput.trim();
      const updatedUser: any = await acceptInvitation(code);

      updateUser({
        role: updatedUser.role,
        workspaceId: updatedUser.workspaceId,
      } as any);

      alert("¡Te has unido al equipo con éxito!");
      setJoinInput("");
      fetchMembers();
    } catch (err: any) {
      alert(err.message || "Enlace o código inválido.");
    } finally {
      setIsJoining(false);
    }
  };

  const currentUser = members.find((m) => m.id === user?.id);

  const isAdmin =
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "OWNER" ||
    (user as any)?.role === "ADMIN" ||
    (user as any)?.role === "OWNER";

  return (
    <div
      style={{ display: "flex", height: "100vh", overflow: "hidden", background: "transparent" }}
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
            padding: "24px 32px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg-card)",
            backdropFilter: "blur(12px)",
            zIndex: 20,
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Gestión de Equipo
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-text-muted)",
              marginTop: 4,
            }}
          >
            Administra los roles, invita colaboradores o únete a un espacio de
            trabajo.
          </p>
        </header>

        <main style={{ padding: "32px", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isAdmin ? "1fr 1fr" : "1fr",
                gap: 24,
              }}
            >
              <SpotlightCard>
                <div
                  style={{
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    gap: 24,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "14px",
                        background: "rgba(34, 211, 160, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(34, 211, 160, 0.2)",
                      }}
                    >
                      <LogIn size={24} color="var(--color-success)" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        Unirse a un equipo
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--color-text-muted)",
                          marginTop: 2,
                        }}
                      >
                        Pega el enlace o el código que te ha dado tu
                        administrador.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      marginTop: "auto",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Ej: AX92-KPL1 o http://..."
                      value={joinInput}
                      onChange={(e) => setJoinInput(e.target.value)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: "var(--color-bg-base)",
                        border: "1px solid var(--color-border-hover)",
                        color: "var(--color-text-primary)",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleJoinTeam}
                      disabled={isJoining || !joinInput.trim()}
                      style={{
                        padding: "12px 28px",
                        borderRadius: "12px",
                        background: "var(--color-text-primary)",
                        border: "none",
                        color: "var(--color-bg-base)",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor:
                          !joinInput.trim() || isJoining
                            ? "not-allowed"
                            : "pointer",
                        opacity: !joinInput.trim() || isJoining ? 0.5 : 1,
                        transition: "all 0.2s",
                      }}
                    >
                      {isJoining ? "Verificando..." : "Solicitar entrada"}
                    </button>
                  </div>
                </div>
              </SpotlightCard>

              {isAdmin && (
                <SpotlightCard>
                  <div
                    style={{
                      padding: "28px",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      gap: 24,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "14px",
                          background: "rgba(124, 58, 237, 0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(124, 58, 237, 0.2)",
                        }}
                      >
                        <Link size={24} color="var(--color-accent)" />
                      </div>
                      <div>
                        <h3
                          style={{
                            fontSize: 17,
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          Invitar colaboradores
                        </h3>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--color-text-muted)",
                            marginTop: 2,
                          }}
                        >
                          Genera una llave de acceso única para nuevos miembros.
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginTop: "auto",
                      }}
                    >
                      {!inviteLink ? (
                        <button
                          onClick={handleGenerateLink}
                          disabled={isInviting}
                          style={{
                            width: "100%",
                            padding: "12px 28px",
                            borderRadius: "12px",
                            background:
                              "linear-gradient(135deg, var(--color-accent) 0%, #9333ea 100%)",
                            border: "none",
                            color: "white",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: isInviting ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
                          }}
                        >
                          <Plus size={18} />{" "}
                          {isInviting ? "Generando..." : "Crear enlace"}
                        </button>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            background: "rgba(255,255,255,0.03)",
                            padding: "8px",
                            borderRadius: "16px",
                            border: "1px solid var(--color-border-hover)",
                            width: "100%",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              padding: "12px 18px",
                              background: "var(--color-bg-base)",
                              borderRadius: "12px",
                              fontSize: 13,
                              color: "var(--color-accent)",
                              fontFamily: "monospace",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {inviteLink}
                          </div>
                          <button
                            onClick={handleCopy}
                            style={{
                              padding: "12px 24px",
                              borderRadius: "12px",
                              background: copied
                                ? "var(--color-success)"
                                : "var(--color-text-primary)",
                              color: copied ? "white" : "var(--color-bg-base)",
                              border: "none",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              )}
            </div>

            <SpotlightCard>
              <div
                style={{
                  padding: "24px 28px",
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
                  Miembros activos
                </h3>
              </div>

              {isLoading ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Cargando equipo...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {members.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 28px",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            background: "var(--color-bg-base)",
                            border: "1px solid var(--color-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          <User size={20} />
                        </div>
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <p style={{ fontSize: 15, fontWeight: 600 }}>
                              {member.name || "Sin nombre"}
                            </p>
                            {member.id === user?.id && (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: "var(--color-accent)",
                                  background: "var(--color-accent-dim)",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  textTransform: "uppercase",
                                }}
                              >
                                Tú
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--color-text-muted)",
                              marginTop: 2,
                            }}
                          >
                            {member.email}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "6px 12px",
                            borderRadius: "8px",
                            background:
                              member.role === "OWNER"
                                ? "rgba(245, 158, 11, 0.1)"
                                : "rgba(124, 58, 237, 0.1)",
                            color:
                              member.role === "OWNER"
                                ? "#f59e0b"
                                : "var(--color-accent)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {member.role}
                        </span>

                        {isAdmin &&
                          member.id !== user?.id &&
                          member.role !== "OWNER" && (
                            <div style={{ position: "relative" }}>
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  handleRoleChange(member.id, e.target.value)
                                }
                                style={{
                                  appearance: "none",
                                  WebkitAppearance: "none",
                                  padding: "8px 36px 8px 16px",
                                  background: "rgba(255,255,255,0.03)",
                                  border: "1px solid var(--color-border-hover)",
                                  borderRadius: "10px",
                                  color: "var(--color-text-primary)",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  cursor: "pointer",
                                  outline: "none",
                                  transition: "all 0.2s",
                                }}
                              >
                                <option
                                  value="EDITOR"
                                  style={{
                                    background: "var(--color-bg-surface)",
                                    color: "var(--color-text-primary)",
                                    padding: "10px",
                                  }}
                                >
                                  Trabajador
                                </option>
                                <option
                                  value="ADMIN"
                                  style={{
                                    background: "var(--color-bg-surface)",
                                    color: "var(--color-text-primary)",
                                    padding: "10px",
                                  }}
                                >
                                  Admin
                                </option>
                              </select>
                              <div
                                style={{
                                  position: "absolute",
                                  right: 12,
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  pointerEvents: "none",
                                  color: "var(--color-text-muted)",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SpotlightCard>
          </div>
        </main>
      </div>
    </div>
  );
}
