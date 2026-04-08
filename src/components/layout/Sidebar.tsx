import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2,
  LayoutDashboard,
  LineChart,
  History,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useDataStore } from "../../stores/dataStore";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: LineChart, label: "Analysis", path: "/dashboard" },
  { icon: History, label: "History", path: "/history" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { resetData } = useDataStore();

  const handleLogout = () => {
    logout();
    resetData();
  };

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        background: "var(--glass-bg)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        borderRight: "1px solid var(--glass-border)",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "28px 20px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--color-accent-dim)",
              border: "1px solid var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 12px var(--color-accent-dim)",
            }}
          >
            <BarChart2 size={14} color="var(--color-accent)" />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            DATASTORY
          </span>
        </div>
        <p
          style={{
            fontSize: 9,
            color: "var(--color-text-muted)",
            letterSpacing: "0.1em",
            paddingLeft: 38,
          }}
        >
          FINANCIAL INTELLIGENCE
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 10px" }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 12px",
                borderRadius: 10,
                marginBottom: 2,
                background: active ? "var(--color-accent-dim)" : "transparent",
                border: active
                  ? "1px solid rgba(124,106,255,0.2)"
                  : "1px solid transparent",
                borderLeft: active
                  ? "3px solid var(--color-accent)"
                  : "3px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon
                size={15}
                color={
                  active ? "var(--color-accent)" : "var(--color-text-muted)"
                }
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 500 : 400,
                  color: active
                    ? "var(--color-accent)"
                    : "var(--color-text-secondary)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div
        style={{
          padding: "12px 10px",
          borderTop: "1px solid var(--glass-border)",
        }}
      >
        <button
          onClick={() => navigate("/settings")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            marginBottom: 4,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--color-accent-dim)",
              border: "1px solid var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User size={12} color="var(--color-accent)" />
          </div>
          <div style={{ minWidth: 0, textAlign: "left" }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name ?? "Usuario"}
            </p>
            <p
              style={{
                fontSize: 10,
                color: "var(--color-text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </p>
          </div>
        </button>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(244,63,94,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut size={14} color="var(--color-danger)" />
          <span style={{ fontSize: 13, color: "var(--color-danger)" }}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
