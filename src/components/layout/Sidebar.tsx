import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useDataStore } from "../../stores/dataStore";

// 1. EL PASILLO LIMPIO: Solo las puertas esenciales
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Team", path: "/team" }, // Futura sala de empleados
  { icon: FileText, label: "Reports", path: "/history" }, // Conectado al Historial
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { resetData } = useDataStore();

  const handleLogout = () => {
    logout();
    resetData();
    navigate("/auth");
  };

  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        background: "var(--color-bg-card)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid var(--color-border)",
        padding: "32px 20px",
      }}
    >
      {/* LOGO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 48,
          paddingLeft: 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-sm)",
            background: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
            X
          </span>
        </div>
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          Outrunix
        </span>
      </div>

      {/* NAVEGACIÓN PRINCIPAL */}
      <nav
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}
      >
        {navItems.map(({ icon: Icon, label, path }) => {
          const active =
            location.pathname === path ||
            (path === "/dashboard" && location.pathname === "/");
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: "12px 18px",
                borderRadius: "var(--radius-xl)",
                background: active ? "var(--color-accent)" : "transparent",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.color = "var(--color-text-primary)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              <Icon size={20} color={active ? "#ffffff" : "currentColor"} />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: active ? "#ffffff" : "var(--color-text-secondary)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* BOTONES INFERIORES */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: "auto",
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            padding: "12px 18px",
            borderRadius: "var(--radius-xl)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-secondary)",
            textAlign: "left",
          }}
        >
          <HelpCircle size={20} />
          <span style={{ fontSize: 15, fontWeight: 500 }}>Help</span>
        </button>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            padding: "12px 18px",
            borderRadius: "var(--radius-xl)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-danger)",
            textAlign: "left",
          }}
        >
          <LogOut size={20} />
          <span style={{ fontSize: 15, fontWeight: 500 }}>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
