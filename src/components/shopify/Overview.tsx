import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function Overview() {
  const { token } = useAuthStore();
  const [storeData, setStoreData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. EL MENSAJERO VUELVE A LA ACCIÓN
  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetch("http://localhost:3001/api/auth/shopify/data", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((datos) => {
          setStoreData(datos);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error trayendo datos:", error);
          setIsLoading(false);
        });
    }
  }, [token]);

  // 2. PREPARAMOS LOS DATOS PARA LA GRÁFICA
  // Convertimos las fechas raras de Shopify en horas fáciles de leer
  const chartData =
    storeData?.recentOrders
      ?.map((order: any) => ({
        name: new Date(order.date).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ventas: order.total,
      }))
      .reverse() || []; // Le damos la vuelta para que el más viejo salga a la izquierda y el más nuevo a la derecha

  // 3. EL PARACAÍDAS (Si está cargando o hay error)
  if (isLoading) {
    return (
      <div
        style={{
          color: "var(--color-text-muted)",
          padding: 40,
          textAlign: "center",
        }}
      >
        ⏳ Analizando tu tienda en tiempo real...
      </div>
    );
  }

  if (storeData?.error) {
    return (
      <div
        style={{
          background: "rgba(244,63,94,0.1)",
          padding: 24,
          borderRadius: 12,
          border: "1px solid var(--color-danger)",
          color: "var(--color-danger)",
        }}
      >
        <h3>🛑 Bloqueo de Privacidad</h3>
        <p>{storeData.error}</p>
      </div>
    );
  }

  // 4. EL ESCENARIO FINAL (Tarjetas + Gráfica)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* --- LAS 3 TARJETAS DE MÉTRICAS --- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}
      >
        {/* Tarjeta 1: Ingresos */}
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
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
              Ingresos Totales
            </span>
            <div
              style={{
                padding: 8,
                background: "rgba(34, 197, 94, 0.1)",
                borderRadius: 8,
              }}
            >
              <DollarSign size={20} color="#22c55e" />
            </div>
          </div>
          <p
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            ${storeData?.totalRevenue?.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Tarjeta 2: Pedidos */}
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
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
              Pedidos
            </span>
            <div
              style={{
                padding: 8,
                background: "rgba(59, 130, 246, 0.1)",
                borderRadius: 8,
              }}
            >
              <ShoppingCart size={20} color="#3b82f6" />
            </div>
          </div>
          <p
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            {storeData?.orderCount || 0}
          </p>
        </div>

        {/* Tarjeta 3: Productos */}
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
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
              Catálogo
            </span>
            <div
              style={{
                padding: 8,
                background: "rgba(168, 85, 247, 0.1)",
                borderRadius: 8,
              }}
            >
              <Package size={20} color="#a855f7" />
            </div>
          </div>
          <p
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            {storeData?.productCount || 0}
          </p>
        </div>
      </div>

      {/* --- LA GRÁFICA DE TENDENCIAS (RECHARTS) --- */}
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
            marginBottom: 24,
          }}
        >
          <TrendingUp size={20} color="var(--color-text-primary)" />
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Tendencia de Ventas (Últimos Pedidos)
          </h3>
        </div>

        <div style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="var(--color-text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
                itemStyle={{ color: "var(--color-accent)", fontWeight: 700 }}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="var(--color-accent)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--color-accent)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
