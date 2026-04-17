import { useState, useEffect } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Overview } from "../components/shopify/Overview";
import { Products } from "../components/shopify/Products";
import { Orders } from "../components/shopify/Orders";
import { Customers } from "../components/shopify/Customers";
import { ExcelImport } from "../components/shopify/ExcelImport";
import { AiDocumentAnalyst } from "../components/shopify/AiDocumentAnalyst";
import { Analytics } from "../components/shopify/Analytics";
import { TeamReports } from "../components/shopify/TeamReports";
import { DataChat } from "../components/shopify/DataChat";
import { SnapshotsHistory } from "../components/shopify/SnapshotsHistory";
import { useShopifyStore } from "../stores/shopifyStore";
import { useAuthStore } from "../stores/authStore";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { BASE_URL } from "../services/api.service";

export function ShopifyDashboardPage() {
  const {
    isConnected,
    isSkipped,
    setConnection,
    setIsSkipped,
    activeView,
    setActiveView,
  } = useShopifyStore();
  const { user } = useAuthStore();
  const [shopUrl, setShopUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setConnection(true, "Tienda Conectada");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setConnection]);

  const handleConnect = () => {
    if (!shopUrl) {
      alert("Por favor, escribe el nombre de tu tienda.");
      return;
    }
    const cleanShopName = shopUrl.replace(".myshopify.com", "").trim();
    const finalShopDomain = `${cleanShopName}.myshopify.com`;
    window.location.href = `${BASE_URL}/api/auth/shopify?shop=${finalShopDomain}&userId=${user?.id}`;
  };

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <Overview />;
      case "products":
        return <Products />;
      case "orders":
        return <Orders />;
      case "customers":
        return <Customers />;
      case "analytics":
        return <Analytics />;
      case "excel":
        return <ExcelImport />;
      case "ai-docs":
        return <AiDocumentAnalyst />;
      case "team-reports":
        return <TeamReports />;
      case "history":
        return <SnapshotsHistory />;
      default:
        return <Overview />;
    }
  };

  if (!isConnected && !isSkipped) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg-base)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480, width: "100%", padding: 40 }}>
          <span style={{ fontSize: 64, display: "block", marginBottom: 24 }}>
            🛍️
          </span>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 12,
            }}
          >
            Conecta tu tienda de Shopify
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              marginBottom: 32,
              lineHeight: 1.5,
            }}
          >
            Sincroniza tus productos y ventas en tiempo real para desbloquear el
            poder de la Inteligencia Artificial.
          </p>

          <div
            style={{
              background: "var(--color-bg-card)",
              padding: 24,
              borderRadius: 16,
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", gap: "12px", marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "var(--color-bg-surface)",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border)",
                  flex: 1,
                }}
              >
                <input
                  type="text"
                  placeholder="mi-tienda"
                  value={shopUrl}
                  onChange={(e) => setShopUrl(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    width: "100%",
                  }}
                />
                <span
                  style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
                >
                  .myshopify.com
                </span>
              </div>
              <button
                onClick={handleConnect}
                style={{
                  padding: "0 24px",
                  background:
                    "linear-gradient(135deg, #95bf47 0%, #5e8e3e 100%)",
                  color: "#fff",
                  borderRadius: 8,
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Vincular
              </button>
            </div>

            <button
              onClick={() => {
                setIsSkipped(true);
                setActiveView("excel");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                fontSize: 14,
                textDecoration: "underline",
                fontWeight: 500,
              }}
            >
              Continuar sin tienda de Shopify
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--color-bg-base)",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <main
          style={{
            padding: "32px",
            flex: 1,
            overflowY: "auto",
            paddingBottom: "100px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {isSkipped && !isConnected && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "rgba(255, 171, 0, 0.1)",
                border: "1px solid rgba(255, 171, 0, 0.3)",
                borderRadius: 12,
                color: "#ffab00",
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
                Estás en modo manual. Las analíticas automáticas de Shopify no
                están disponibles. Dirígete a la pestaña "Excel Import" para
                subir tus datos manualmente.
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              Shopify Intelligence
            </h1>

            <div
              style={{
                display: "flex",
                gap: 8,
                background: "var(--color-bg-card)",
                padding: 4,
                borderRadius: 12,
                border: "1px solid var(--color-border)",
              }}
            >
              <button
                onClick={() => setActiveView("overview")}
                style={tabStyle(activeView === "overview")}
              >
                <LayoutDashboard size={16} /> Resumen
              </button>
              <button
                onClick={() => setActiveView("products")}
                style={tabStyle(activeView === "products")}
              >
                <Package size={16} /> Productos
              </button>
              <button
                onClick={() => setActiveView("orders")}
                style={tabStyle(activeView === "orders")}
              >
                <ShoppingCart size={16} /> Pedidos
              </button>
            </div>
          </div>

          {renderView()}
        </main>
      </div>
      <DataChat />
    </div>
  );
}

const tabStyle = (active: boolean) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  background: active ? "var(--color-accent)" : "transparent",
  color: active ? "#fff" : "var(--color-text-muted)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
});
