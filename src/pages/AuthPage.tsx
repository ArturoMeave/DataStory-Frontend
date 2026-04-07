import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, Mail, Lock, User, AlertCircle, Shield } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../stores/authStore";
import {
  loginUser,
  registerUser,
  verify2FALogin,
} from "../services/api.service";

type Mode = "login" | "register";
type Step = "auth" | "2fa";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
    <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z" />
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
  </svg>
)

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("auth");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (step === "auth") {
        if (mode === "login") {
          const result = await loginUser(email, password);

          if (result.requiresTwoFactor && result.userId) {
            setPendingUserId(result.userId);
            setStep("2fa");
          } else if (result.token && result.user) {
            login(result.token, result.user);
            navigate("/dashboard");
          } else {
            throw new Error("Respuesta inválida del servidor.");
          }
        } else {
          const result = await registerUser(email, password, name);
          login(result.token, result.user);
          navigate("/dashboard");
        }
      } else if (step === "2fa") {
        if (!pendingUserId) throw new Error("Falta el ID del usuario.");

        const result = await verify2FALogin(pendingUserId, twoFactorCode);
        login(result.token, result.user);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al conectar con el servidor.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 300,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, rgba(124,106,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "var(--color-accent-dim)",
              border: "1px solid var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BarChart2 size={18} color="var(--color-accent)" />
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            DataStory
          </span>
        </div>

        <div
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: 32,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 6,
              }}
            >
              {step === "2fa"
                ? "Autenticación de Dos Pasos"
                : mode === "login"
                  ? "Bienvenido de vuelta"
                  : "Crear una cuenta"}
            </h1>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
              {step === "2fa"
                ? "Introduce el código de 6 dígitos de tu aplicación autenticadora"
                : mode === "login"
                  ? "Inicia sesión para acceder a tu dashboard"
                  : "Empieza a analizar tus datos con IA"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {step === "auth" && mode === "register" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Nombre
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={14}
                    color="var(--color-text-muted)"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      fontSize: 13,
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border-hover)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}

            {step === "auth" && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Email
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      size={14}
                      color="var(--color-text-muted)"
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 36px",
                        fontSize: 13,
                        borderRadius: "var(--radius-md)",
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border-hover)",
                        color: "var(--color-text-primary)",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={14}
                      color="var(--color-text-muted)"
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        mode === "register" ? "Mínimo 6 caracteres" : "••••••••"
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 36px",
                        fontSize: 13,
                        borderRadius: "var(--radius-md)",
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border-hover)",
                        color: "var(--color-text-primary)",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {step === "2fa" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Código de verificación
                </label>
                <div style={{ position: "relative" }}>
                  <Shield
                    size={14}
                    color="var(--color-text-muted)"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                  <input
                    type="text"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Ej. 123456"
                    maxLength={6}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      fontSize: 16,
                      letterSpacing: "2px",
                      textAlign: "center",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border-hover)",
                      color: "var(--color-text-primary)",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-danger-dim)",
                  border: "1px solid var(--color-danger)",
                }}
              >
                <AlertCircle
                  size={14}
                  color="var(--color-danger)"
                  style={{ marginTop: 1, flexShrink: 0 }}
                />
                <p style={{ fontSize: 13, color: "var(--color-danger)" }}>
                  {error}
                </p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              loading={isLoading}
              type="submit"
              style={{ width: "100%", marginTop: 4 }}
            >
              {step === "2fa"
                ? "Verificar código"
                : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
            </Button>
          </form>

          {step === "auth" && (
            <>
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === "login" ? "register" : "login");
                      setError(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-accent)",
                    }}
                  >
                    {mode === "login" ? "Regístrate" : "Inicia sesión"}
                  </button>
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0 16px" }}>
                <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>o continúa con</span>
                <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
              </div>

              {/* Botón Google */}
              <a
                href={`${import.meta.env.VITE_API_URL ?? "http://localhost:3001"}/api/auth/google`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-hover)",
                  color: "var(--color-text-primary)",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border-hover)";
                }}
              >
                <GoogleIcon />
                Continuar con Google
              </a>
            </>
          )}

          {step === "2fa" && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                type="button"
                onClick={() => {
                  setStep("auth");
                  setPendingUserId(null);
                  setTwoFactorCode("");
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                }}
              >
                ← Volver al login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}