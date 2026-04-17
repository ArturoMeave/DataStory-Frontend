import { useState, useEffect } from "react";
import { BrainCircuit, TrendingUp } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BASE_URL } from "../../services/api.service";

export function Analytics() {
  const { token } = useAuthStore();
  const [storeData, setStoreData] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchDataAndAnalyze = async () => {
      try {
        const shopifyRes = await fetch(
          `${BASE_URL}/api/auth/shopify/data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const shopifyData = await shopifyRes.json();
        setStoreData(shopifyData);

        if (shopifyData.error) {
          setIsAnalyzing(false);
          return;
        }

        const prompt = `Analiza estos datos de mi tienda: Ingresos totales: $${shopifyData.totalRevenue}, Pedidos totales: ${shopifyData.orderCount}, Clientes totales: ${shopifyData.customerList?.length || 0}. Actúa como un asesor de negocios y dame 3 consejos breves y directos para mejorar mis ventas basados en estos números.`;

        const aiRes = await fetch(`${BASE_URL}/api/ai/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            prompt,
            systemPrompt:
              "Eres un consultor de comercio electrónico experto. Sé conciso, profesional y usa formato de viñetas. No uses lenguaje robótico.",
            maxTokens: 500,
          }),
        });

        const aiData = await aiRes.json();
        setAiInsight(aiData.content || "No se pudo generar el análisis.");
      } catch (error) {
        setAiInsight("Hubo un error al conectar con el asistente virtual.");
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchDataAndAnalyze();
  }, [token]);

  const topCustomers =
    storeData?.customerList
      ?.sort((a: any, b: any) => b.totalSpent - a.totalSpent)
      ?.slice(0, 5) || [];

  if (isAnalyzing)
    return (
      <div
        style={{
          color: "var(--color-text-muted)",
          padding: 40,
          textAlign: "center",
        }}
      >
        🧠 La Inteligencia Artificial está analizando tu negocio...
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
          }}
        >
          <BrainCircuit size={24} color="#a855f7" />
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Consultor de Inteligencia Artificial
          </h3>
        </div>
        <div
          style={{
            color: "var(--color-text-primary)",
            lineHeight: "1.7",
            fontSize: 15,
            whiteSpace: "pre-wrap",
            background: "rgba(168,85,247,0.05)",
            padding: 24,
            borderRadius: 12,
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          {aiInsight}
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
          <TrendingUp size={20} color="#3b82f6" />
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Top 5 Clientes por Volumen de Compra
          </h3>
        </div>
        <div style={{ height: 300, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomers}>
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
                cursor={{ fill: "rgba(255,255,255,0.02)" }}
                contentStyle={{
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  color: "var(--color-text-primary)",
                }}
              />
              <Bar dataKey="totalSpent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
