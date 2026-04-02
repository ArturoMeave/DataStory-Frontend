import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../stores/authStore";
import { loginUser, registerUser } from "../services/api.service";

type Mode = "login" | "register";

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result =
        mode === "login"
          ? await loginUser(email, password)
          : await registerUser(email, password, name);

      login(result.token, result.user);
      navigate("/dashboard");
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
      {/* Glow decorativo */}
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
        {/* Logo */}
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

        {/* Card del formulario */}
        <div
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            padding: 32,
          }}
        >
          {/* Título */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 6,
              }}
            >
              {mode === "login" ? "Bienvenido de vuelta" : "Crear una cuenta"}
            </h1>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
              {mode === "login"
                ? "Inicia sesión para acceder a tu dashboard"
                : "Empieza a analizar tus datos con IA"}
            </p>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Nombre — solo en registro */}
            {mode === "register" && (
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
                      fontFamily: "var(--font-sans)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "var(--color-accent)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "var(--color-border-hover)";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email */}
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
                    fontFamily: "var(--font-sans)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-accent)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-border-hover)";
                  }}
                />
              </div>
            </div>

            {/* Contraseña */}
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
                    fontFamily: "var(--font-sans)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--color-accent)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--color-border-hover)";
                  }}
                />
              </div>
            </div>

            {/* Error */}
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

            {/* Botón submit */}
            <Button
              variant="primary"
              size="lg"
              loading={isLoading}
              type="submit"
              style={{ width: "100%", marginTop: 4 }}
            >
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
          </form>

          {/* Toggle login/registro */}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
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
                  fontFamily: "var(--font-sans)",
                }}
              >
                {mode === "login" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
