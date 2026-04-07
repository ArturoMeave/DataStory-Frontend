import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart2 } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const name = searchParams.get("name");

    if (token && id && email) {
      login(token, { id, email, name: name || null });
      navigate("/dashboard");
    } else {
      navigate("/auth?error=google");
    }
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: "var(--color-accent-dim)",
          border: "1px solid var(--color-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BarChart2 size={20} color="var(--color-accent)" />
      </div>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>
        Iniciando sesión con Google...
      </p>
    </div>
  );
}
