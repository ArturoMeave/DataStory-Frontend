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
  FileText,
  History,
  Link as LinkIcon,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useShopifyStore } from "../../stores/shopifyStore";
import { useState } from "react";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { activeView, setActiveView, isConnected, setIsSkipped } =
    useShopifyStore();
  const [isOpen, setIsOpen] = useState(true);

  const allItems = [
    {
      id: "overview",
      label: "Resumen Global",
      icon: LayoutDashboard,
      shopifyOnly: false,
    },
    {
      id: "excel",
      label: "Importar Excel",
      icon: FileSpreadsheet,
      shopifyOnly: false,
    },
    {
      id: "ai-docs",
      label: "Analista PDF",
      icon: FileText,
      shopifyOnly: false,
    },
    { id: "products", label: "Productos", icon: Package, shopifyOnly: true },
    { id: "orders", label: "Pedidos", icon: ShoppingCart, shopifyOnly: true },
    { id: "customers", label: "Clientes", icon: Users, shopifyOnly: true },
    {
      id: "analytics",
      label: "Shopify Analytics",
      icon: BarChart3,
      shopifyOnly: true,
    },
  ];

  const visibleItems = allItems.filter((item) =>
    isConnected ? true : !item.shopifyOnly,
  );

  const getBtnStyle = (
    isActive: boolean,
    isDanger = false,
    isSpecial = false,
  ) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: isOpen ? "flex-start" : "center",
    gap: 12,
    width: isOpen ? "100%" : "48px",
    height: "48px",
    margin: isOpen ? "0 0 4px 0" : "0 auto 8px auto",
    padding: isOpen ? "0 16px" : "0",
    borderRadius: 12,
    background: isSpecial
      ? "rgba(149, 191, 71, 0.15)"
      : isActive
        ? "var(--color-accent)"
        : "transparent",
    border: isSpecial ? "1px solid rgba(149, 191, 71, 0.3)" : "none",
    color: isSpecial
      ? "#95bf47"
      : isDanger
        ? "#ff4d4d"
        : isActive
          ? "white"
          : "var(--color-text-secondary)",
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
          marginBottom: 32,
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
          }}
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div
        style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}
        className="custom-scrollbar"
      >
        <nav>
          {visibleItems.map((item) => {
            const isActive =
              location.pathname === "/shopify" && activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  navigate("/shopify");
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

        {!isConnected && (
          <>
            <div
              style={{
                height: "1px",
                background: "var(--color-border)",
                margin: "16px 0",
                opacity: 0.4,
              }}
            />
            <button
              onClick={() => {
                setIsSkipped(false);
                navigate("/shopify");
              }}
              style={getBtnStyle(false, false, true)}
              title="Vincular Shopify"
            >
              <LinkIcon size={20} style={{ flexShrink: 0 }} />
              {isOpen && (
                <span style={{ fontWeight: 700, fontSize: 13 }}>
                  Vincular Shopify
                </span>
              )}
            </button>
          </>
        )}

        <div
          style={{
            height: "1px",
            background: "var(--color-border)",
            margin: "20px 0",
            opacity: 0.6,
          }}
        />

        {/* SECCIÓN SISTEMA */}
        <nav>
          {/* NUEVO BOTÓN DE REGISTRO */}
          <button
            onClick={() => {
              setActiveView("history");
              navigate("/shopify");
            }}
            style={getBtnStyle(
              location.pathname === "/shopify" && activeView === "history",
            )}
            title="Registro de Informes"
          >
            <History size={20} style={{ flexShrink: 0 }} />
            {isOpen && (
              <span style={{ fontWeight: 600, fontSize: 14 }}>Registro</span>
            )}
          </button>

          {/* TEAM REPORTS ORIGINAL */}
          <button
            onClick={() => navigate("/team")}
            style={getBtnStyle(location.pathname === "/team")}
            title="Team Reports"
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
        <button onClick={logout} style={getBtnStyle(false, true)}>
          <LogOut size={20} style={{ flexShrink: 0 }} />
          {isOpen && <span style={{ fontWeight: 700 }}>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
