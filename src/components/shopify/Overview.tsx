import { useState, useEffect } from "react";
import {
  AlertCircle,
  Camera,
  Download,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useShopifyStore } from "../../stores/shopifyStore";
import { useDataStore } from "../../stores/dataStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { RevenueLineChart } from "../charts/RevenueLineChart";
import { ExpenseBarChart } from "../charts/ExpenseBarChart";
import {
  formatCurrency,
  totalRevenue,
  totalExpenses,
  netProfit,
} from "../../utils/dataAggregator";
import { BASE_URL } from "../../services/api.service";

export function Overview() {
  const { token } = useAuthStore();
  const { isConnected, isSkipped } = useShopifyStore();
  const { rows, setRows } = useDataStore();

  const [storeData, setStoreData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isConnected && token) {
      setIsLoading(true);
      fetch(`${BASE_URL}/api/auth/shopify/data`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((datos) => {
          setStoreData(datos);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [token, isConnected]);

  useEffect(() => {
    if (isSkipped && !isConnected && token) {
      fetch(`${BASE_URL}/api/workspace/data`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.rows && data.rows.length > 0) setRows(data.rows);
        })
        .catch(() => {});
    }
  }, [isSkipped, isConnected, token, setRows]);

  const exportToPDF = async () => {
    const element = document.getElementById("dashboard-content");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`Reporte_DataStory_${new Date().toLocaleDateString()}.pdf`);
    } catch (err) {
      alert("Error al generar PDF.");
    }
  };

  const saveSnapshot = async () => {
    const rev = totalRevenue(rows);
    const exp = totalExpenses(rows);
    const profit = netProfit(rows);

    const res = await fetch(`${BASE_URL}/api/snapshots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        totalRevenue: rev,
        totalExpenses: exp,
        netProfit: profit,
        periodCount: rows.length,
        recentPeriods: rows.slice(-5),
      }),
    });

    if (res.ok) alert("Snapshot guardado con éxito.");
  };

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
            No hay datos
          </h3>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: 400 }}>
            Importa tu Excel primero.
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
            Dashboard Universal
          </h2>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={exportToPDF}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <Download size={18} /> Exportar PDF
            </button>
            <button
              onClick={saveSnapshot}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: "var(--color-accent)",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <Camera size={18} /> Guardar Informe
            </button>
          </div>
        </div>

        <div
          id="dashboard-content"
          style={{
            padding: "20px",
            background: "var(--color-bg-base)",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 24,
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
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--color-text-muted)",
                  marginBottom: 8,
                }}
              >
                INGRESOS TOTALES
              </p>
              <h3 style={{ fontSize: 32, fontWeight: 800 }}>
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
                }}
              >
                GASTOS TOTALES
              </p>
              <h3 style={{ fontSize: 32, fontWeight: 800 }}>
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
                }}
              >
                BENEFICIO NETO
              </p>
              <h3
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color:
                    profit >= 0
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                }}
              >
                {formatCurrency(profit)}
              </h3>
            </div>
          </div>
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
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                Evolución
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
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                Gastos
              </h3>
              <div style={{ height: 300 }}>
                <ExpenseBarChart />
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "8px" }}></div>
      </div>
    );
  }

  if (isLoading)
    return (
      <div
        style={{
          color: "var(--color-text-muted)",
          padding: 40,
          textAlign: "center",
        }}
      >
        ⏳ Analizando...
      </div>
    );

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
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={exportToPDF}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "var(--color-bg-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <Download size={18} /> Exportar PDF
        </button>
      </div>
      <div
        id="dashboard-content"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: "20px",
          background: "var(--color-bg-base)",
          borderRadius: 16,
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
            <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
              Ingresos Totales
            </span>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
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
            <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
              Pedidos
            </span>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
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
            <span style={{ fontWeight: 600, color: "var(--color-text-muted)" }}>
              Catálogo
            </span>
            <p style={{ fontSize: 32, fontWeight: 700 }}>
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
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>
            Ventas
          </h3>
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
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ventas"
                  stroke="var(--color-accent)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
