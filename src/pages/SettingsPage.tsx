import { useState, useEffect } from "react";
import { useThemeStore } from "../stores/themeStore";
import { Sun, Moon, Palette, RotateCcw } from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import {
  User,
  Building,
  ShieldCheck,
  Shield,
  AlertCircle,
  Monitor,
  Smartphone,
  Trash2,
  LogOut,
  Laptop,
  Apple,
  X,
  Lock,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import {
  generate2FA,
  enable2FA,
  update2FAFrequency,
  getSessions,
  revokeSession,
  revokeAllSessions,
  deleteAccount,
} from "../services/api.service";

interface SessionData {
  id: string;
  device: string;
  browser: string;
  ip: string;
  createdAt: string;
  lastUsed: string;
  isCurrent: boolean;
}

function getDeviceIcon(device: string) {
  if (device === "iOS" || device === "Mac") return Apple;
  if (device === "Android" || device === "Móvil") return Smartphone;
  if (device === "Windows" || device === "Linux") return Laptop;
  return Monitor;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "workspace" | "devices"
  >("profile");
  const { user, updateUser, logout } = useAuthStore();
  const { theme, toggleTheme, colors, updateColor, resetColors } =
    useThemeStore();

  // ── 2FA ──────────────────────────────────────────────────────────────────
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [frequency, setFrequency] = useState("always");
  const [is2FASetupVisible, setIs2FASetupVisible] = useState(false);
  const [error2FA, setError2FA] = useState<string | null>(null);
  const [success2FA, setSuccess2FA] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newFrequency, setNewFrequency] = useState(
    user?.twoFactorFrequency ?? "always",
  );
  const [freqCode, setFreqCode] = useState("");
  const [freqError, setFreqError] = useState<string | null>(null);
  const [freqSuccess, setFreqSuccess] = useState<string | null>(null);
  const [isFreqCodeVisible, setIsFreqCodeVisible] = useState(false);
  const [isFreqLoading, setIsFreqLoading] = useState(false);

  const frequencyLabels: Record<string, string> = {
    always: "Pedir siempre (más seguro)",
    "7d": "Cada semana",
    "15d": "Cada 15 días",
    "30d": "Cada mes",
  };

  const handleGenerate2FA = async () => {
    try {
      setIsLoading(true);
      setError2FA(null);
      const res = await generate2FA();
      setQrCode(res.qrCodeDataUrl);
      setIs2FASetupVisible(true);
    } catch {
      setError2FA("Error al generar el código QR.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (twoFactorCode.length !== 6) {
      setError2FA("El código debe tener 6 dígitos.");
      return;
    }
    try {
      setIsLoading(true);
      setError2FA(null);
      await enable2FA(twoFactorCode, frequency);
      updateUser({ isTwoFactorEnabled: true, twoFactorFrequency: frequency });
      setSuccess2FA("¡2FA activado con éxito!");
      setQrCode(null);
      setTwoFactorCode("");
    } catch {
      setError2FA("El código es incorrecto o ha expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFrequency = async () => {
    if (freqCode.length !== 6) {
      setFreqError("El código debe tener 6 dígitos.");
      return;
    }
    try {
      setIsFreqLoading(true);
      setFreqError(null);
      await update2FAFrequency(freqCode, newFrequency);
      updateUser({ twoFactorFrequency: newFrequency });
      setFreqSuccess(
        `Frecuencia actualizada a "${frequencyLabels[newFrequency]}".`,
      );
      setFreqCode("");
      setIsFreqCodeVisible(false);
    } catch {
      setFreqError("Código incorrecto.");
    } finally {
      setIsFreqLoading(false);
    }
  };

  // ── Dispositivos ──────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    sessionId: string;
    device: string;
    browser: string;
    isCurrent: boolean;
  } | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    getSessions()
      .then((data) => setSessions(data as SessionData[]))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);

  const openConfirmModal = (session: SessionData) => {
    setConfirmModal({
      sessionId: session.id,
      device: session.device,
      browser: session.browser,
      isCurrent: session.isCurrent,
    });
    setConfirmPassword("");
    setConfirmError(null);
  };

  const handleConfirmRevoke = async () => {
    if (!confirmModal) return;
    if (!confirmPassword.trim()) {
      setConfirmError("La contraseña es obligatoria.");
      return;
    }
    setConfirmLoading(true);
    setConfirmError(null);
    try {
      await revokeSession(confirmModal.sessionId, confirmPassword);
      setSessions((prev) =>
        prev.filter((s) => s.id !== confirmModal.sessionId),
      );
      if (confirmModal.isCurrent) logout();
      setConfirmModal(null);
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : "Error al revocar la sesión.",
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRevokeAll = async () => {
    await revokeAllSessions();
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  };

  // ── Eliminar cuenta ───────────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("La contraseña es obligatoria.");
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteAccount(deletePassword);
      logout();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Error al eliminar la cuenta.",
      );
      setDeleteLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <Sidebar />

      {/* Modal confirmar revocar sesión */}
      {confirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmModal(null);
          }}
        >
          <div
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              padding: 28,
              width: "100%",
              maxWidth: 400,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 4,
                  }}
                >
                  ¿Cerrar esta sesión?
                </h3>
                <p
                  style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
                >
                  {confirmModal.browser} · {confirmModal.device}
                  {confirmModal.isCurrent && (
                    <span
                      style={{ color: "var(--color-warning)", marginLeft: 6 }}
                    >
                      (este dispositivo)
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>
            {confirmModal.isCurrent && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--color-warning-dim)",
                  border: "1px solid var(--color-warning)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <p style={{ fontSize: 13, color: "var(--color-warning)" }}>
                  Estás cerrando tu sesión actual. Se te redirigirá al login
                  automáticamente.
                </p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Lock size={12} /> Confirma tu contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmRevoke();
                }}
                placeholder="Tu contraseña actual"
                autoFocus
                style={{
                  padding: "10px 14px",
                  fontSize: 13,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: `1px solid ${confirmError ? "var(--color-danger)" : "var(--color-border-hover)"}`,
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              />
              {confirmError && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--color-danger)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AlertCircle size={12} /> {confirmError}
                </p>
              )}
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={confirmLoading || !confirmPassword.trim()}
                style={{
                  padding: "8px 16px",
                  background: "var(--color-danger)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: "white",
                  cursor: confirmPassword.trim() ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: confirmPassword.trim() ? 1 : 0.5,
                }}
              >
                {confirmLoading ? "Verificando..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar cuenta */}
      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
        >
          <div
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-danger)",
              borderRadius: "var(--radius-xl)",
              padding: 28,
              width: "100%",
              maxWidth: 420,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--color-danger)",
                    marginBottom: 4,
                  }}
                >
                  Eliminar cuenta permanentemente
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  Esta acción es irreversible. Se borrarán todos tus datos,
                  análisis, snapshots y configuraciones.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div
              style={{
                padding: "12px 16px",
                background: "var(--color-danger-dim)",
                border: "1px solid var(--color-danger)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-danger)",
                  lineHeight: 1.6,
                }}
              >
                Se eliminarán permanentemente: tu perfil, todos tus análisis
                financieros, historial de snapshots y configuración de alertas.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Lock size={12} /> Confirma tu contraseña para continuar
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value);
                  setDeleteError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleDeleteAccount();
                }}
                placeholder="Tu contraseña actual"
                autoFocus
                style={{
                  padding: "10px 14px",
                  fontSize: 13,
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: `1px solid ${deleteError ? "var(--color-danger)" : "var(--color-border-hover)"}`,
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              />
              {deleteError && (
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--color-danger)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <AlertCircle size={12} /> {deleteError}
                </p>
              )}
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword.trim()}
                style={{
                  padding: "8px 16px",
                  background: "var(--color-danger)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color: "white",
                  cursor: deletePassword.trim() ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontWeight: 500,
                  opacity: deletePassword.trim() ? 1 : 0.5,
                }}
              >
                {deleteLoading ? "Eliminando..." : "Eliminar mi cuenta"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            background: "var(--color-bg-card)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Ajustes
          </h1>
        </header>

        <main style={{ padding: "28px 32px", flex: 1 }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 8,
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: 16,
                marginBottom: 24,
              }}
            >
              {[
                { key: "profile", label: "Mi Perfil", icon: User },
                { key: "workspace", label: "Mi Empresa", icon: Building },
                { key: "devices", label: "Dispositivos", icon: Monitor },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 16px",
                    background:
                      activeTab === key
                        ? "var(--color-accent-dim)"
                        : "transparent",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    color:
                      activeTab === key
                        ? "var(--color-accent)"
                        : "var(--color-text-secondary)",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Perfil */}
            {activeTab === "profile" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                {/* Info Personal */}
                <div
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 24,
                  }}
                >
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: 16,
                    }}
                  >
                    Información Personal
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={user?.name || ""}
                        disabled
                        style={{
                          padding: "10px 14px",
                          background: "var(--color-bg-elevated)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--color-text-secondary)",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <label
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                        }}
                      >
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        style={{
                          padding: "10px 14px",
                          background: "var(--color-bg-elevated)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--color-text-secondary)",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2FA */}
                <div
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Shield size={18} color="var(--color-accent)" />
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Seguridad y Autenticación
                    </h2>
                  </div>

                  {user?.isTwoFactorEnabled ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 16px",
                          background: "rgba(34,211,160,0.08)",
                          border: "1px solid var(--color-success)",
                          borderRadius: "var(--radius-md)",
                        }}
                      >
                        <ShieldCheck size={18} color="var(--color-success)" />
                        <div>
                          <p
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "var(--color-success)",
                            }}
                          >
                            Autenticación de Dos Pasos activa
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-muted)",
                              marginTop: 2,
                            }}
                          >
                            Tu cuenta tiene una capa extra de seguridad.
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <label
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Frecuencia de verificación
                        </label>
                        <select
                          value={newFrequency}
                          onChange={(e) => {
                            setNewFrequency(e.target.value);
                            setIsFreqCodeVisible(true);
                            setFreqError(null);
                            setFreqSuccess(null);
                            setFreqCode("");
                          }}
                          style={{
                            padding: "10px 14px",
                            background: "var(--color-bg-elevated)",
                            border: "1px solid var(--color-border-hover)",
                            borderRadius: "var(--radius-md)",
                            color: "var(--color-text-primary)",
                            fontSize: 14,
                            outline: "none",
                            cursor: "pointer",
                          }}
                        >
                          <option value="always">
                            Pedir siempre (más seguro)
                          </option>
                          <option value="7d">Cada semana</option>
                          <option value="15d">Cada 15 días</option>
                          <option value="30d">Cada mes</option>
                        </select>
                      </div>
                      {isFreqCodeVisible && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            padding: 16,
                            background: "var(--color-bg-elevated)",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            Confirma con tu código de 6 dígitos:
                          </p>
                          <div style={{ display: "flex", gap: 10 }}>
                            <input
                              type="text"
                              value={freqCode}
                              onChange={(e) => setFreqCode(e.target.value)}
                              placeholder="123456"
                              maxLength={6}
                              style={{
                                flex: 1,
                                padding: "10px 14px",
                                fontSize: 16,
                                letterSpacing: "2px",
                                textAlign: "center",
                                borderRadius: "var(--radius-md)",
                                background: "var(--color-bg-base)",
                                border: "1px solid var(--color-border-hover)",
                                color: "var(--color-text-primary)",
                                outline: "none",
                              }}
                            />
                            <button
                              onClick={handleUpdateFrequency}
                              disabled={isFreqLoading || freqCode.length !== 6}
                              style={{
                                padding: "0 18px",
                                background: "var(--color-accent)",
                                color: "white",
                                border: "none",
                                borderRadius: "var(--radius-md)",
                                cursor:
                                  freqCode.length === 6
                                    ? "pointer"
                                    : "not-allowed",
                                fontWeight: 500,
                                opacity: freqCode.length === 6 ? 1 : 0.5,
                              }}
                            >
                              {isFreqLoading ? "..." : "Confirmar"}
                            </button>
                          </div>
                          {freqError && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--color-danger)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <AlertCircle size={12} /> {freqError}
                            </p>
                          )}
                        </div>
                      )}
                      {freqSuccess && (
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--color-success)",
                          }}
                        >
                          ✓ {freqSuccess}
                        </p>
                      )}
                    </div>
                  ) : success2FA ? (
                    <div
                      style={{
                        background: "rgba(34,211,160,0.1)",
                        border: "1px solid var(--color-success)",
                        padding: 16,
                        borderRadius: "var(--radius-md)",
                        color: "var(--color-success)",
                        fontSize: 14,
                      }}
                    >
                      {success2FA}
                    </div>
                  ) : !is2FASetupVisible ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Protege tu cuenta con la Autenticación de Dos Pasos.
                      </p>
                      <button
                        onClick={handleGenerate2FA}
                        disabled={isLoading}
                        style={{
                          alignSelf: "flex-start",
                          padding: "10px 20px",
                          background: "var(--color-accent)",
                          color: "white",
                          border: "none",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                      >
                        {isLoading ? "Cargando..." : "Configurar 2FA"}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                        background: "var(--color-bg-elevated)",
                        padding: 20,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {qrCode && (
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              marginBottom: 20,
                              textAlign: "left",
                            }}
                          >
                            <label
                              style={{
                                fontSize: 12,
                                color: "var(--color-text-muted)",
                                textTransform: "uppercase",
                              }}
                            >
                              ¿Con qué frecuencia pedir el código?
                            </label>
                            <select
                              value={frequency}
                              onChange={(e) => setFrequency(e.target.value)}
                              style={{
                                padding: "10px 14px",
                                background: "var(--color-bg-base)",
                                border: "1px solid var(--color-border-hover)",
                                borderRadius: "var(--radius-md)",
                                color: "var(--color-text-primary)",
                                fontSize: 14,
                                outline: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="always">
                                Pedir siempre (más seguro)
                              </option>
                              <option value="7d">Cada semana</option>
                              <option value="15d">Cada 15 días</option>
                              <option value="30d">Cada mes</option>
                            </select>
                          </div>
                          <p
                            style={{
                              fontSize: 14,
                              color: "var(--color-text-primary)",
                              marginBottom: 12,
                            }}
                          >
                            1. Escanea este código QR con tu aplicación.
                          </p>
                          <img
                            src={qrCode}
                            alt="2FA QR Code"
                            style={{
                              border: "4px solid white",
                              borderRadius: 8,
                            }}
                          />
                        </div>
                      )}
                      <div
                        style={{
                          borderTop: "1px solid var(--color-border)",
                          paddingTop: 20,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 14,
                            color: "var(--color-text-primary)",
                            marginBottom: 12,
                          }}
                        >
                          2. Introduce el código de 6 dígitos.
                        </p>
                        <div style={{ display: "flex", gap: 12 }}>
                          <input
                            type="text"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            style={{
                              flex: 1,
                              padding: "10px 14px",
                              fontSize: 16,
                              letterSpacing: "2px",
                              textAlign: "center",
                              borderRadius: "var(--radius-md)",
                              background: "var(--color-bg-base)",
                              border: "1px solid var(--color-border-hover)",
                              color: "var(--color-text-primary)",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={handleEnable2FA}
                            disabled={isLoading || twoFactorCode.length !== 6}
                            style={{
                              padding: "0 20px",
                              background: "var(--color-accent)",
                              color: "white",
                              border: "none",
                              borderRadius: "var(--radius-md)",
                              cursor:
                                twoFactorCode.length === 6
                                  ? "pointer"
                                  : "not-allowed",
                              fontWeight: 500,
                              opacity: twoFactorCode.length === 6 ? 1 : 0.5,
                            }}
                          >
                            Verificar y Activar
                          </button>
                        </div>
                      </div>
                      {error2FA && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 14px",
                            borderRadius: "var(--radius-md)",
                            background: "var(--color-danger-dim)",
                            color: "var(--color-danger)",
                            fontSize: 13,
                            border: "1px solid var(--color-danger)",
                          }}
                        >
                          <AlertCircle size={14} /> {error2FA}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Apariencia ── */}
                <div
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 20,
                    }}
                  >
                    <Palette size={18} color="var(--color-accent)" />
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Apariencia
                    </h2>
                  </div>

                  {/* Toggle tema */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 24,
                      padding: "14px 16px",
                      background: "var(--color-bg-elevated)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      {theme === "dark" ? (
                        <Moon size={16} color="var(--color-accent)" />
                      ) : (
                        <Sun size={16} color="var(--color-warning)" />
                      )}
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--color-text-primary)",
                          }}
                        >
                          Modo {theme === "dark" ? "oscuro" : "claro"}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {theme === "dark"
                            ? "Tema dark premium activo"
                            : "Tema light activo"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        background:
                          theme === "dark"
                            ? "var(--color-accent)"
                            : "var(--color-border-hover)",
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 2,
                          left: theme === "dark" ? 22 : 2,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "white",
                          transition: "left 0.2s",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                        }}
                      />
                    </button>
                  </div>

                  {/* Colores personalizables */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "var(--color-text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Colores del sistema
                      </p>
                      <button
                        onClick={resetColors}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          color: "var(--color-text-muted)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <RotateCcw size={11} /> Restaurar
                      </button>
                    </div>

                    {[
                      {
                        key: "accent" as const,
                        label: "Color principal",
                        description: "Botones, iconos activos, links",
                      },
                      {
                        key: "success" as const,
                        label: "Éxito / Ingresos",
                        description: "KPIs positivos, confirmaciones",
                      },
                      {
                        key: "danger" as const,
                        label: "Peligro / Gastos",
                        description: "Alertas, anomalías, gastos",
                      },
                      {
                        key: "warning" as const,
                        label: "Advertencia",
                        description: "Avisos, estados intermedios",
                      },
                    ].map(({ key, label, description }) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 14px",
                          background: "var(--color-bg-elevated)",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              background: colors[key],
                              boxShadow: `0 0 12px ${colors[key]}40`,
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "var(--color-text-primary)",
                              }}
                            >
                              {label}
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {description}
                            </p>
                          </div>
                        </div>
                        <input
                          type="color"
                          value={colors[key]}
                          onChange={(e) => updateColor(key, e.target.value)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            border: "1px solid var(--color-border)",
                            cursor: "pointer",
                            background: "transparent",
                            padding: 2,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Zona de peligro */}
                <div
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-danger)",
                    borderRadius: "var(--radius-lg)",
                    padding: 24,
                  }}
                >
                  <h2
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "var(--color-danger)",
                      marginBottom: 8,
                    }}
                  >
                    Zona de peligro
                  </h2>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--color-text-secondary)",
                      marginBottom: 16,
                      lineHeight: 1.6,
                    }}
                  >
                    Una vez que elimines tu cuenta no hay vuelta atrás. Todos
                    tus datos serán borrados permanentemente.
                  </p>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setDeletePassword("");
                      setDeleteError(null);
                    }}
                    style={{
                      padding: "10px 20px",
                      background: "var(--color-danger-dim)",
                      border: "1px solid var(--color-danger)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--color-danger)",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--color-danger)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "var(--color-danger-dim)";
                      e.currentTarget.style.color = "var(--color-danger)";
                    }}
                  >
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Workspace */}
            {activeTab === "workspace" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                <div
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Workspace de la Empresa
                    </h2>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        padding: "4px 10px",
                        background: "rgba(34,211,160,0.1)",
                        color: "var(--color-success)",
                        borderRadius: 12,
                      }}
                    >
                      <ShieldCheck size={14} /> ADMINISTRADOR
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.6,
                      marginBottom: 20,
                    }}
                  >
                    Aquí podrás invitar a otros miembros a tu equipo y cambiar
                    permisos.
                  </p>
                  <div
                    style={{
                      padding: "20px",
                      background: "var(--color-bg-elevated)",
                      border: "1px dashed var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{ color: "var(--color-text-muted)", fontSize: 13 }}
                    >
                      Vista de Roles y Permisos en construcción...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Dispositivos */}
            {activeTab === "devices" && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 24 }}
              >
                <div
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    padding: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <h2
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                          marginBottom: 4,
                        }}
                      >
                        Dispositivos vinculados
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        Gestiona dónde está activa tu cuenta.
                      </p>
                    </div>
                    {sessions.filter((s) => !s.isCurrent).length > 0 && (
                      <button
                        onClick={handleRevokeAll}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          background: "var(--color-danger-dim)",
                          border: "1px solid var(--color-danger)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--color-danger)",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <LogOut size={12} /> Cerrar todas las demás
                      </button>
                    )}
                  </div>

                  {sessionsLoading ? (
                    <p
                      style={{ fontSize: 14, color: "var(--color-text-muted)" }}
                    >
                      Cargando...
                    </p>
                  ) : sessions.length === 0 ? (
                    <p
                      style={{ fontSize: 14, color: "var(--color-text-muted)" }}
                    >
                      No hay sesiones activas. Inicia sesión de nuevo para
                      verlas aquí.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {sessions.map((session) => {
                        const DeviceIcon = getDeviceIcon(session.device);
                        return (
                          <div
                            key={session.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 16px",
                              background: "var(--color-bg-elevated)",
                              border: `1px solid ${session.isCurrent ? "var(--color-accent)" : "var(--color-border)"}`,
                              borderRadius: "var(--radius-md)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "var(--radius-md)",
                                  background: session.isCurrent
                                    ? "var(--color-accent-dim)"
                                    : "var(--color-bg-card)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <DeviceIcon
                                  size={16}
                                  color={
                                    session.isCurrent
                                      ? "var(--color-accent)"
                                      : "var(--color-text-muted)"
                                  }
                                />
                              </div>
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 2,
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: 13,
                                      fontWeight: 500,
                                      color: "var(--color-text-primary)",
                                    }}
                                  >
                                    {session.browser} · {session.device}
                                  </p>
                                  {session.isCurrent && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        padding: "1px 7px",
                                        background: "var(--color-accent-dim)",
                                        color: "var(--color-accent)",
                                        borderRadius: 10,
                                        letterSpacing: "0.05em",
                                      }}
                                    >
                                      ESTE DISPOSITIVO
                                    </span>
                                  )}
                                </div>
                                <p
                                  style={{
                                    fontSize: 12,
                                    color: "var(--color-text-muted)",
                                  }}
                                >
                                  IP: {session.ip} ·{" "}
                                  {new Date(
                                    session.lastUsed,
                                  ).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => openConfirmModal(session)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 32,
                                height: 32,
                                background: "transparent",
                                border: "1px solid var(--color-border)",
                                borderRadius: "var(--radius-md)",
                                cursor: "pointer",
                                color: "var(--color-text-muted)",
                                transition: "all 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor =
                                  "var(--color-danger)";
                                e.currentTarget.style.color =
                                  "var(--color-danger)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor =
                                  "var(--color-border)";
                                e.currentTarget.style.color =
                                  "var(--color-text-muted)";
                              }}
                              title="Cerrar esta sesión"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
