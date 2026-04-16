import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useShopifyStore } from "../../stores/shopifyStore";
import { useDataStore } from "../../stores/dataStore";
import { DataChat } from "./DataChat"; // <-- Componente del chat importado
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { RevenueLineChart } from "../charts/RevenueLineChart";
import { ExpenseBarChart } from "../charts/ExpenseBarChart";
import {
  formatCurrency,
  totalRevenue,
  totalExpenses,
  netProfit,
} from "../../utils/dataAggregator";

export function Overview() {
  const { token } = useAuthStore();
  const { isConnected, isSkipped } = useShopifyStore();
  const { rows, setRows } = useDataStore();

  const [storeData, setStoreData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch de Shopify
  useEffect(() => {
    if (isConnected && token) {
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
  }, [token, isConnected]);

  // Fetch de los datos guardados del Excel (Persistencia)
  useEffect(() => {
    if (isSkipped && !isConnected && token) {
      fetch("http://localhost:3001/api/workspace/data", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.rows && data.rows.length > 0) {
            setRows(data.rows);
          }
        })
        .catch((error) => console.error("Error recuperando Excel:", error));
    }
  }, [isSkipped, isConnected, token, setRows]);

  // =======================================================================
  // 🟢 MODO 1: DASHBOARD UNIVERSAL (Datos del Excel)
  // =======================================================================
  if (isSkipped && !isConnected) {
    if (rows.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            textAlign: "center",
            background: "var(--color-bg-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px dashed var(--color-border)",
            animation: "fadeSlideUp 0.4s ease-out",
          }}
        >
          <AlertCircle
            size={48}
            color="var(--color-text-muted)"
            style={{ marginBottom: 16 }}
          />
          <h3
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 8,
            }}
          >
            No hay datos en memoria
          </h3>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: 400 }}>
            Dirígete a la pestaña "Importar Excel" y sube tu archivo CSV para
            que nuestro motor genere tu Dashboard automáticamente.
          </p>
        </div>
      );
    }

    const rev = totalRevenue(rows);
    const exp = totalExpenses(rows);
    const profit = netProfit(rows);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          animation: "fadeSlideUp 0.4s ease-out",
        }}
      >
        {/* Tarjetas KPI */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
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
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Ingresos Totales
            </p>
            <h3
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "var(--color-text-primary)",
              }}
            >
              {formatCurrency(rev)}
            </h3>
          </div>
          <div
            style={{
              background: "var(--color-bg-card)",
              padding: 24,
              borderRadius: 16,
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Gastos Totales
            </p>
            <h3
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "var(--color-text-primary)",
              }}
            >
              {formatCurrency(exp)}
            </h3>
          </div>
          <div
            style={{
              background: "var(--color-bg-card)",
              padding: 24,
              borderRadius: 16,
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              Beneficio Neto
            </p>
            <h3
              style={{
                fontSize: 32,
                fontWeight: 800,
                color:
                  profit >= 0 ? "var(--color-success)" : "var(--color-danger)",
              }}
            >
              {profit > 0 ? "+" : ""}
              {formatCurrency(profit)}
            </h3>
          </div>
        </div>

        {/* Gráficas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            minHeight: 400,
          }}
        >
          <div
            style={{
              background: "var(--color-bg-card)",
              borderRadius: 16,
              border: "1px solid var(--color-border)",
              padding: 16,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 16,
                paddingLeft: 8,
              }}
            >
              Evolución de Ingresos
            </h3>
            <div style={{ height: 300 }}>
              <RevenueLineChart />
            </div>
          </div>
          <div
            style={{
              background: "var(--color-bg-card)",
              borderRadius: 16,
              border: "1px solid var(--color-border)",
              padding: 16,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 16,
                paddingLeft: 8,
              }}
            >
              Desglose de Gastos
            </h3>
            <div style={{ height: 300 }}>
              <ExpenseBarChart />
            </div>
          </div>
        </div>

        {/* <-- AQUÍ SE AÑADE EL CHAT PARA EL EXCEL --> */}
        <div style={{ marginTop: "8px" }}>
          <DataChat />
        </div>
      </div>
    );
  }

  // =======================================================================
  // 🛍️ MODO 2: DASHBOARD DE SHOPIFY (Original)
  // =======================================================================
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

  const chartData =
    storeData?.recentOrders
      ?.map((order: any) => ({
        name: new Date(order.date).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ventas: order.total,
      }))
      .reverse() || [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        animation: "fadeSlideUp 0.4s ease-out",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
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
            Tendencia de Ventas
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
