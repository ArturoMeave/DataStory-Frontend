import { useState, useRef, useEffect } from "react";
import { Send, Bot, X, MessageSquare, Loader2 } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useDataStore } from "../../stores/dataStore";
import { useShopifyStore } from "../../stores/shopifyStore";
import { BASE_URL } from "../../services/api.service";

export function DataChat() {
  const { token } = useAuthStore();
  const { rows } = useDataStore();
  const { isConnected, activeView } = useShopifyStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: "¡Hola! Soy tu Copiloto Financiero. Estoy analizando tus datos en tiempo real. ¿Qué necesitas saber sobre tu negocio hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !token) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      // 1. Barrido de datos en paralelo
      const headers = { Authorization: `Bearer ${token}` };
      
      const promises = [
        fetch(`${BASE_URL}/api/snapshots/me`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`${BASE_URL}/api/invitations`, { headers }).then(r => r.json()).catch(() => []),
      ];

      if (isConnected) {
        promises.push(
          fetch(`${BASE_URL}/api/auth/shopify/data`, { headers })
            .then(r => r.json())
            .catch(() => ({}))
        );
      } else {
        promises.push(Promise.resolve({}));
      }

      const [snapshots, invitations, shopifyData] = await Promise.all(promises);

      const totalInformesGuardados = Array.isArray(snapshots) ? snapshots.length : 0;
      const totalMiembros = Array.isArray(invitations) ? invitations.length : 0;

      // 2. Construimos el masterContext Omnisciente
      const masterContext = {
        appState: {
          modo_conexion: isConnected ? "Shopify" : "Manual (Excel)",
          pestaña_activa: activeView,
        },
        financials: {
          ingresos_totales: shopifyData?.totalRevenue || shopifyData?.ingresos || 0,
          pedidos_totales: shopifyData?.totalOrders || shopifyData?.pedidos || 0,
          filas_en_pantalla: rows.length,
        },
        workspace: {
          total_snapshots: totalInformesGuardados,
          total_miembros: totalMiembros,
        }
      };

      const res = await fetch(`${BASE_URL}/api/ai/analyze-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: masterContext,
          prompt: userText,
        }),
      });

      if (!res.ok) throw new Error("Error en la respuesta de la IA");

      const responseData = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: responseData.analysis },
      ]);
    } catch (error) {
      console.error("Error al hablar con la IA:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Lo siento, parece que hay un problema de conexión con mi cerebro. ¿Podrías intentarlo de nuevo?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          background:
            "linear-gradient(135deg, var(--color-accent) 0%, #7c6aff 100%)",
          color: "white",
          border: "none",
          boxShadow: "0 8px 24px rgba(149, 191, 71, 0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        width: "380px",
        height: "550px",
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "20px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
        animation: "fadeSlideUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, var(--color-accent) 0%, #7c6aff 100%)",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Bot size={20} />
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              Copiloto IA
            </h3>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>
              DataStory Inteligencia
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 12,
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                background:
                  msg.role === "user"
                    ? "var(--color-accent)"
                    : "var(--color-bg-surface)",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: 14,
                maxWidth: "80%",
                color:
                  msg.role === "user" ? "white" : "var(--color-text-primary)",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div
            style={{
              display: "flex",
              gap: 8,
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            <Loader2 size={16} className="animate-spin" /> Analizando datos...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: "16px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: 10,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Pregunta sobre tus informes o datos..."
          style={{
            flex: 1,
            background: "var(--color-bg-surface)",
            border: "1px solid var(--color-border)",
            padding: "10px 16px",
            borderRadius: "20px",
            outline: "none",
            color: "var(--color-text-primary)",
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          style={{
            background: "var(--color-accent)",
            color: "white",
            border: "none",
            width: "40px",
            height: "40px",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
