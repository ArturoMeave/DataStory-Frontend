import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ShoppingBag,
  Package,
  ShoppingCart,
  BarChart3,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useShopifyStore } from "../../stores/shopifyStore"; // Importamos el cerebro de Shopify
import { useState } from "react";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { activeView, setActiveView } = useShopifyStore(); // Controlamos la vista activa
  const [isOpen, setIsOpen] = useState(true); // Para el toggle colapsable

  // 1. LÓGICA DE NAVEGACIÓN: Definimos las sub-secciones de Shopify
  const shopifyItems = [
    { id: "overview", label: "Resumen", icon: LayoutDashboard },
    { id: "products", label: "Productos", icon: Package },
    { id: "orders", label: "Pedidos", icon: ShoppingCart },
    { id: "customers", label: "Clientes", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "excel", label: "Excel Import", icon: FileSpreadsheet },
  ];

  // 2. LÓGICA DE BOTÓN ACTIVO: Función para no repetir código de estilos
  const getBtnStyle = (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: "12px 16px",
    borderRadius: 100,
    background: isActive ? "var(--color-accent)" : "transparent",
    border: "none",
    color: isActive ? "white" : "var(--color-text-secondary)",
    cursor: "pointer",
    textAlign: "left" as const,
    transition: "all 0.2s ease",
    marginBottom: 4,
  });

  return (
    <aside
      style={{
        width: isOpen ? 260 : 80,
        minHeight: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        background: "var(--color-bg-surface)",
        borderRight: "1px solid var(--color-border)",
        padding: "24px 16px",
        zIndex: 30,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER Y BOTÓN COLAPSAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          marginBottom: 40,
        }}
      >
        {isOpen && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            <span
              style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}
            >
              Outrunix
            </span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            cursor: "pointer",
            padding: 4,
            color: "var(--color-text-secondary)",
          }}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* SECCIÓN SHOPIFY ANALYTICS */}
      <div style={{ marginBottom: 24 }}>
        {isOpen && (
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-muted)",
              letterSpacing: 1.5,
              paddingLeft: 16,
              marginBottom: 12,
            }}
          >
            SHOPIFY HUB
          </p>
        )}
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
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {isOpen && (
                  <span style={{ fontWeight: 500, fontSize: 14 }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SECCIÓN SISTEMA CORE (Team & Settings) */}
      <div style={{ marginTop: "auto", paddingBottom: 80 }}>
        {isOpen && (
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-text-muted)",
              letterSpacing: 1.5,
              paddingLeft: 16,
              marginBottom: 12,
            }}
          >
            SISTEMA
          </p>
        )}

        <button
          onClick={() => navigate("/team")}
          style={getBtnStyle(location.pathname === "/team")}
          title="Team"
        >
          <Users size={18} />
          {isOpen && (
            <span style={{ fontWeight: 500, fontSize: 14 }}>Team Reports</span>
          )}
        </button>

        <button
          onClick={() => navigate("/settings")}
          style={getBtnStyle(location.pathname === "/settings")}
          title="Settings"
        >
          <Settings size={18} />
          {isOpen && (
            <span style={{ fontWeight: 500, fontSize: 14 }}>Settings</span>
          )}
        </button>
      </div>

      {/* BOTÓN CERRAR SESIÓN */}
      <div style={{ position: "absolute", bottom: 24, left: 16, right: 16 }}>
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "12px 16px",
            color: "var(--color-danger)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <LogOut size={18} />
          {isOpen && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
