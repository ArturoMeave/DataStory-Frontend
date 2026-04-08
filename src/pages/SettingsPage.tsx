import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import {
  generate2FA,
  enable2FA,
  update2FAFrequency,
  getSessions,
  revokeSession,
  revokeAllSessions,
} from "../services/api.service";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "workspace" | "devices"
  >("profile");
  const { user, updateUser } = useAuthStore();

  // Estados para 2FA
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [frequency, setFrequency] = useState("always");
  const [is2FASetupVisible, setIs2FASetupVisible] = useState(false);
  const [error2FA, setError2FA] = useState<string | null>(null);
  const [success2FA, setSuccess2FA] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para dispositivos
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      device: string;
      browser: string;
      ip: string;
      createdAt: string;
      lastUsed: string;
    }>
  >([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    await revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const handleRevokeAll = async () => {
    await revokeAllSessions();
    setSessions([]);
  };

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
      await enable2FA(twoFactorCode, frequency);
      updateUser({ isTwoFactorEnabled: true, twoFactorFrequency: frequency });
      setSuccess2FA(
        "¡Autenticación de 2 Pasos activada con éxito! Tu cuenta está protegida.",
      );
      setQrCode(null);
      setTwoFactorCode("");
    } catch (err) {
      setError2FA("El código es incorrecto o ha expirado.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleUpdateFrequency = async () => {
    if (freqCode.length !== 6) {
      setFreqError("El código debe tener exactamente 6 dígitos.");
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
    } catch (err) {
      setFreqError("Código incorrecto. Inténtalo de nuevo.");
    } finally {
      setIsFreqLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--color-bg-base)",
      }}
    >
      <Sidebar />

      <div
        style={{
          marginLeft: 220,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
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
              <button
                onClick={() => setActiveTab("profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background:
                    activeTab === "profile"
                      ? "var(--color-accent-dim)"
                      : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color:
                    activeTab === "profile"
                      ? "var(--color-accent)"
                      : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "all 0.2s",
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
                  background:
                    activeTab === "workspace"
                      ? "var(--color-accent-dim)"
                      : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color:
                    activeTab === "workspace"
                      ? "var(--color-accent)"
                      : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                <Building size={16} />
                Mi Empresa (Roles)
              </button>
              <button
                onClick={() => setActiveTab("devices")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 16px",
                  background:
                    activeTab === "devices"
                      ? "var(--color-accent-dim)"
                      : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  color:
                    activeTab === "devices"
                      ? "var(--color-accent)"
                      : "var(--color-text-secondary)",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                <Monitor size={16} />
                Dispositivos
              </button>
            </div>

            {/* Tab: Perfil */}
            {activeTab === "profile" && (
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
                      gap: 20,
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
                          Frecuencia de verificación actual
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
                            Confirma el cambio introduciendo tu código actual de
                            6 dígitos:
                          </p>
                          <div style={{ display: "flex", gap: 10 }}>
                            <input
                              type="text"
                              value={freqCode}
                              onChange={(e) => setFreqCode(e.target.value)}
                              placeholder="Ej. 123456"
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
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 13,
                                color: "var(--color-danger)",
                              }}
                            >
                              <AlertCircle size={13} /> {freqError}
                            </div>
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
                                letterSpacing: "0.05em",
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
                          2. Introduce el código de 6 dígitos que genera la app.
                        </p>
                        <div style={{ display: "flex", gap: 12 }}>
                          <input
                            type="text"
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            placeholder="Ej. 123456"
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
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Dispositivos vinculados
                    </h2>
                    {sessions.length > 1 && (
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
                        <LogOut size={12} />
                        Cerrar todas las demás
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
                      No hay sesiones activas registradas. Inicia sesión de
                      nuevo para verlas aquí.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "14px 16px",
                            background: "var(--color-bg-elevated)",
                            border: "1px solid var(--color-border)",
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
                                background: "var(--color-accent-dim)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {session.device === "Móvil" ? (
                                <Smartphone
                                  size={16}
                                  color="var(--color-accent)"
                                />
                              ) : (
                                <Monitor
                                  size={16}
                                  color="var(--color-accent)"
                                />
                              )}
                            </div>
                            <div>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                {session.browser} · {session.device}
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "var(--color-text-muted)",
                                  marginTop: 2,
                                }}
                              >
                                IP: {session.ip} · Último acceso:{" "}
                                {new Date(session.lastUsed).toLocaleDateString(
                                  "es-ES",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevokeSession(session.id)}
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
                      ))}
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
