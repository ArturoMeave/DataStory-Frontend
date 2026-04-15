import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Package,
  ShoppingCart,
  BarChart3,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  BarChart2,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useShopifyStore } from "../../stores/shopifyStore";
import { useState } from "react";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { activeView, setActiveView } = useShopifyStore();
  const [isOpen, setIsOpen] = useState(true);

  const shopifyItems = [
    { id: "overview", label: "Resumen", icon: LayoutDashboard },
    { id: "products", label: "Productos", icon: Package },
    { id: "orders", label: "Pedidos", icon: ShoppingCart },
    { id: "customers", label: "Clientes", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "excel", label: "Excel Import", icon: FileSpreadsheet },
  ];

  const getBtnStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: isOpen ? "flex-start" : "center",
    gap: 12,
    width: isOpen ? "100%" : "48px",
    height: "48px",
    margin: isOpen ? "0 0 4px 0" : "0 auto 8px auto",
    padding: isOpen ? "0 16px" : "0",
    borderRadius: 12,
    background: isActive ? "var(--color-accent)" : "transparent",
    border: "none",
    color: isActive ? "white" : "var(--color-text-secondary)",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
  });

  return (
    <aside
      style={{
        width: isOpen ? 260 : 80,
        height: "100vh",
        flexShrink: 0,
        background: "var(--color-bg-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "24px 16px",
        zIndex: 100,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          marginBottom: isOpen ? 32 : 16,
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              minWidth: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BarChart2 size={20} color="white" />
          </div>

          {isOpen && (
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "var(--color-text-primary)",
                letterSpacing: -0.5,
                whiteSpace: "nowrap",
              }}
            >
              DataStory
            </span>
          )}
        </div>

        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 6,
              cursor: "pointer",
              padding: 6,
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            alignSelf: "center",
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            color: "var(--color-text-muted)",
            marginBottom: 20,
            cursor: "pointer",
            padding: 6,
            display: "flex",
          }}
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Aquí también quitamos el margen de 4px del scroll cuando está cerrado */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: isOpen ? 4 : 0,
        }}
        className="custom-scrollbar"
      >
        <nav>
          {shopifyItems.map((item) => {
            const isAtShopify = location.pathname === "/shopify";
            const isActive = isAtShopify && activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  if (!isAtShopify) navigate("/shopify");
                }}
                style={getBtnStyle(isActive)}
                title={item.label}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ flexShrink: 0 }}
                />
                {isOpen && (
                  <span style={{ fontWeight: 600, fontSize: 14 }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            height: "1px",
            background: "var(--color-border)",
            margin: "20px 0",
            opacity: 0.6,
          }}
        />

        <nav>
          <button
            onClick={() => navigate("/team")}
            style={getBtnStyle(location.pathname === "/team")}
            title="Team"
          >
            <Users size={20} style={{ flexShrink: 0 }} />
            {isOpen && (
              <span style={{ fontWeight: 600, fontSize: 14 }}>
                Team Reports
              </span>
            )}
          </button>

          <button
            onClick={() => navigate("/settings")}
            style={getBtnStyle(location.pathname === "/settings")}
            title="Settings"
          >
            <Settings size={20} style={{ flexShrink: 0 }} />
            {isOpen && (
              <span style={{ fontWeight: 600, fontSize: 14 }}>Settings</span>
            )}
          </button>
        </nav>
      </div>

      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isOpen ? "flex-start" : "center",
            gap: 12,
            width: isOpen ? "100%" : "48px",
            height: "48px",
            margin: isOpen ? "0" : "0 auto",
            padding: isOpen ? "0 16px" : "0",
            color: "#ff4d4d",
            background: "rgba(255, 77, 77, 0.05)",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {isOpen && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
