import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader2, AlertCircle, Download, Bot } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { BASE_URL } from "../services/api.service";

export function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/snapshots/share/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Informe no encontrado o expirado");
        return res.json();
      })
      .then((data) => {
        setSnapshot(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const exportToPDF = async () => {
    const element = document.getElementById("share-content");
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
      pdf.save(`Reporte_Historico_${new Date().toLocaleDateString()}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF:", err);
    }
  };

  useEffect(() => {
    if (snapshot && searchParams.get("download") === "true") {
      setTimeout(() => {
        exportToPDF();
      }, 1500);
    }
  }, [snapshot, searchParams]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2
          className="animate-spin"
          size={32}
          color="var(--color-accent)"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <AlertCircle size={48} color="var(--color-danger)" />
        <h2 style={{ fontSize: 24, color: "var(--color-text-primary)" }}>
          {error}
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--color-bg-card)",
            padding: "16px 24px",
            borderRadius: 12,
            border: "1px solid var(--color-border)",
          }}
        >
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              Reporte Público DataStory
            </h1>
            <p
              style={{
                margin: 0,
                color: "var(--color-text-muted)",
                fontSize: 13,
              }}
            >
              Fecha: {new Date(snapshot.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={exportToPDF}
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
            <Download size={18} /> Descargar PDF
          </button>
        </div>

        <div
          id="share-content"
          style={{
            background: "var(--color-bg-base)",
            padding: 20,
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* AI Summary Highlight */}
          {snapshot.aiSummary && (
            <div style={{
              background: "linear-gradient(135deg, rgba(149, 191, 71, 0.1) 0%, rgba(124, 106, 255, 0.05) 100%)",
              border: "1px solid var(--color-accent)",
              borderRadius: 16,
              padding: 24,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Bot size={24} color="var(--color-accent)" />
                <h3 style={{ margin: 0, fontSize: 18, color: "var(--color-text-primary)" }}>Resumen de Inteligencia Artificial</h3>
              </div>
              <p style={{ margin: 0, lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
                {snapshot.aiSummary}
              </p>
            </div>
          )}

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
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  marginBottom: 8,
                }}
              >
                INGRESOS TOTALES
              </p>
              <h3 style={{ fontSize: 32, fontWeight: 800 }}>
                {snapshot.totalRevenue}
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
                  color: "var(--color-text-muted)",
                  marginBottom: 8,
                }}
              >
                GASTOS TOTALES
              </p>
              <h3 style={{ fontSize: 32, fontWeight: 800 }}>
                {snapshot.totalExpenses}
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
                    snapshot.netProfit >= 0
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                }}
              >
                {snapshot.netProfit}
              </h3>
            </div>
          </div>

          {/* Sección de Gráficas Profesionales Escalable */}
          <div style={{
            background: "var(--color-bg-card)",
            padding: 24,
            borderRadius: 16,
            border: "1px solid var(--color-border)",
            height: 400
          }}>
            <h3 style={{ margin: "0 0 24px 0", fontSize: 18, color: "var(--color-text-primary)" }}>
              Evolución Financiera Histórica
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.chartData || [
                  { name: 'Ene', ingresos: 4000, gastos: 2400 },
                  { name: 'Feb', ingresos: 3000, gastos: 1398 },
                  { name: 'Mar', ingresos: 2000, gastos: 9800 },
                  { name: 'Abr', ingresos: 2780, gastos: 3908 },
                  { name: 'May', ingresos: 1890, gastos: 4800 },
                  { name: 'Jun', ingresos: 2390, gastos: 3800 },
                  { name: 'Jul', ingresos: 3490, gastos: 4300 },
                ]}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-danger)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-danger)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Area type="monotone" dataKey="ingresos" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" />
                <Area type="monotone" dataKey="gastos" stroke="var(--color-danger)" strokeWidth={2} fillOpacity={1} fill="url(#colorGastos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
