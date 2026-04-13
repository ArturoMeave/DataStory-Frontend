import { useState, useEffect } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Navbar } from "../components/layout/Navbar";
import { useShopifyStore } from "../stores/shopifyStore";
import { useAuthStore } from "../stores/authStore";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";

export function ShopifyDashboardPage() {
  const { isConnected, setConnection } = useShopifyStore();

  // 1. Sacamos el "token" (tu gafete de seguridad) para poder hablar con el Backend
  const { user, token } = useAuthStore();

  const [shopUrl, setShopUrl] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // 2. NUEVAS MEMORIAS A CORTO PLAZO: Una para los datos y otra para saber si está cargando
  const [storeData, setStoreData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // El detective que mira si acabas de volver de Shopify con éxito
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setConnection(true, "Tienda Conectada");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setConnection]);

  // 3. EL MENSAJERO DE DATOS (Se ejecuta automáticamente cuando te conectas)
  useEffect(() => {
    if (isConnected && token) {
      setIsLoading(true); // Encendemos el letrero de "Cargando..."

      // Llamamos por teléfono al Backend a la nueva puerta que creamos
      fetch("http://localhost:3001/api/auth/shopify/data", {
        headers: {
          Authorization: `Bearer ${token}`, // Le enseñamos nuestro gafete de seguridad
        },
      })
        .then((respuesta) => respuesta.json()) // Traducimos la respuesta
        .then((datos) => {
          setStoreData(datos); // Guardamos los datos reales en la memoria (incluso si es un error)
          setIsLoading(false); // Apagamos el letrero de "Cargando..."
        })
        .catch((error) => {
          console.error("Error trayendo datos:", error);
          setIsLoading(false);
        });
    }
  }, [isConnected, token]);

  const handleConnect = () => {
    if (!shopUrl) {
      alert("Por favor, escribe el nombre de tu tienda.");
      return;
    }
    const cleanShopName = shopUrl.replace(".myshopify.com", "").trim();
    const finalShopDomain = `${cleanShopName}.myshopify.com`;
    window.location.href = `http://localhost:3001/api/auth/shopify?shop=${finalShopDomain}&userId=${user?.id}`;
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
            // --- PANTALLA 1: PEDIR CONEXIÓN ---
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
            // --- PANTALLA 2: EL DASHBOARD CON DATOS REALES ---
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

                {/* Pestañas de navegación interna */}
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
                    onClick={() => setActiveTab("overview")}
                    style={tabStyle(activeTab === "overview")}
                  >
                    <LayoutDashboard size={16} /> Resumen
                  </button>
                  <button
                    onClick={() => setActiveTab("products")}
                    style={tabStyle(activeTab === "products")}
                  >
                    <Package size={16} /> Productos
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    style={tabStyle(activeTab === "orders")}
                  >
                    <ShoppingCart size={16} /> Pedidos
                  </button>
                </div>
              </div>

              {/* ─── AQUÍ EMPIEZA LA MAGIA DEL PARACAÍDAS ─── */}
              {isLoading ? (
                // 1. Si está cargando, mostramos el reloj de arena
                <div
                  style={{
                    padding: 60,
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                  }}
                >
                  <div className="spinner" style={{ marginBottom: 16 }}>
                    ⏳
                  </div>
                  Sincronizando con tu tienda...
                </div>
              ) : storeData && !storeData.error ? (
                // 2. Si hay datos Y NO hay error, mostramos las tarjetas de dinero y pedidos
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 24,
                  }}
                >
                  <div
                    style={{
                      background: "var(--color-bg-card)",
                      padding: 24,
                      borderRadius: 16,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <DollarSign size={20} color="#22c55e" />
                      <span style={{ fontWeight: 600 }}>Ingresos Totales</span>
                    </div>
                    <p
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        margin: 0,
                      }}
                    >
                      ${storeData.totalRevenue?.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  <div
                    style={{
                      background: "var(--color-bg-card)",
                      padding: 24,
                      borderRadius: 16,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <ShoppingCart size={20} color="#3b82f6" />
                      <span style={{ fontWeight: 600 }}>Pedidos Totales</span>
                    </div>
                    <p
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        margin: 0,
                      }}
                    >
                      {storeData.orderCount || 0}
                    </p>
                  </div>

                  <div
                    style={{
                      background: "var(--color-bg-card)",
                      padding: 24,
                      borderRadius: 16,
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 16,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <Package size={20} color="#a855f7" />
                      <span style={{ fontWeight: 600 }}>Productos Activos</span>
                    </div>
                    <p
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        margin: 0,
                      }}
                    >
                      {storeData.productCount || 0}
                    </p>
                  </div>
                </div>
              ) : storeData && storeData.error ? (
                // 3. Si hay datos, PERO el backend nos devolvió un error (El bloqueo de Shopify)
                <div
                  style={{
                    background: "rgba(244,63,94,0.1)",
                    padding: 24,
                    borderRadius: 12,
                    border: "1px solid var(--color-danger)",
                    color: "var(--color-danger)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span>🛑</span> Acceso Bloqueado por Shopify
                  </h3>
                  <p style={{ margin: "0 0 8px 0", lineHeight: "1.5" }}>
                    Tu servidor funciona perfectamente, pero Shopify nos ha
                    bloqueado la lectura por motivos de privacidad.
                  </p>
                  <p
                    style={{ margin: "0 0 8px 0", fontSize: 14, opacity: 0.9 }}
                  >
                    <strong>Detalle técnico:</strong> {storeData.error}
                  </p>
                  <div
                    style={{
                      marginTop: 16,
                      padding: 12,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 8,
                    }}
                  >
                    <strong>Solución rápida:</strong> Ve a tu panel de Shopify
                    Partners {">"} Apps {">"} DataStory {">"} API Access {">"}{" "}
                    Protected customer data, y solicita acceso aprobando las
                    opciones.
                  </div>
                </div>
              ) : (
                // 4. Si la memoria está vacía por alguna otra razón (Error genérico)
                <div style={{ color: "var(--color-danger)" }}>
                  No se pudieron cargar los datos.
                </div>
              )}
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
