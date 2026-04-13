import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Team", path: "/team" }, // <-- ESTA ES LA PUERTA CORRECTA
  { icon: FileText, label: "Reports", path: "/history" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "var(--color-bg-card)",
        borderRight: "1px solid var(--color-border)",
        padding: "32px 20px",
        zIndex: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 48,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "white", fontWeight: "bold" }}>X</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 600 }}>Outrunix</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "12px 16px",
                borderRadius: 100,
                background: active ? "var(--color-accent)" : "transparent",
                border: "none",
                color: active ? "white" : "var(--color-text-secondary)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Icon size={18} />
              <span style={{ fontWeight: 500 }}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          position: "absolute",
          bottom: 32,
          left: 20,
          right: 20,
        }}
      >
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 16px",
            color: "var(--color-danger)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <LogOut size={18} /> <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
