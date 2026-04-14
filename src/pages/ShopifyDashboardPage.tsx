import { useState, useEffect } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { Overview } from "../components/shopify/Overview";
import { Products } from "../components/shopify/Products";
import { Orders } from "../components/shopify/Orders";
import { Customers } from "../components/shopify/Customers";
import { useShopifyStore } from "../stores/shopifyStore";
import { useAuthStore } from "../stores/authStore";
import { LayoutDashboard, Package, ShoppingCart } from "lucide-react";

const Analytics = () => (
  <div style={{ color: "var(--color-text-primary)", padding: 20 }}>
    📈 Analytics...
  </div>
);
const ExcelImport = () => (
  <div style={{ color: "var(--color-text-primary)", padding: 20 }}>
    📤 Excel...
  </div>
);

export function ShopifyDashboardPage() {
  const { isConnected, setConnection, activeView, setActiveView } =
    useShopifyStore();
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
    window.location.href = `http://localhost:3001/api/auth/shopify?shop=${finalShopDomain}&userId=${user?.id}`;
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
      default:
        return <Overview />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <Sidebar />
      <div
        style={{
          marginLeft: 260,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Navbar />

        <main
          style={{
            padding: "32px",
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {!isConnected ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 64, marginBottom: 24 }}>🛍️</span>
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
                  maxWidth: 450,
                  marginBottom: 32,
                }}
              >
                Sincroniza tus productos y ventas en tiempo real.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  background: "var(--color-bg-card)",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "var(--color-bg-surface)",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
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
                      width: "150px",
                    }}
                  />
                  <span style={{ color: "var(--color-text-muted)" }}>
                    .myshopify.com
                  </span>
                </div>
                <button
                  onClick={handleConnect}
                  style={{
                    padding: "14px 24px",
                    background:
                      "linear-gradient(135deg, #95bf47 0%, #5e8e3e 100%)",
                    color: "#fff",
                    borderRadius: "8px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Vincular
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </main>
      </div>
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
