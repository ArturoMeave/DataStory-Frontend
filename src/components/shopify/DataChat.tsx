import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, X, MessageSquare } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useDataStore } from "../../stores/dataStore";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

export function DataChat() {
  const { token } = useAuthStore();
  const { rows } = useDataStore();

  // Estado para controlar si el chat está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "¡Hola! Soy tu Analista de Datos. ¿En qué puedo ayudarte hoy respecto a tus cifras?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || rows.length === 0) return;

    const userText = inputValue;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: userText },
    ]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "http://localhost:3001/api/ai/analyze-data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: rows, question: userText }),
        },
      );

      const result = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "ai", text: result.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "ai",
          text: "Error al conectar con el analista.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Si el chat está cerrado, mostramos el botón flotante
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
          borderRadius: "50%",
          background: "var(--color-accent)",
          color: "white",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(124, 106, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  // Si está abierto, mostramos la ventana del chat
  return (
    <div
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        width: "380px",
        height: "500px",
        background: "var(--color-bg-card)",
        borderRadius: "16px",
        border: "1px solid var(--color-border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        overflow: "hidden",
        animation: "fadeSlideUp 0.3s ease-out",
      }}
    >
      <div
        style={{
          padding: "16px",
          background: "var(--color-bg-elevated)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={18} color="var(--color-accent)" />
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Analista de Datos
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-muted)",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
        className="custom-scrollbar"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              gap: 10,
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                background:
                  msg.role === "user"
                    ? "var(--color-accent)"
                    : "var(--color-bg-elevated)",
                color:
                  msg.role === "user" ? "white" : "var(--color-text-primary)",
                padding: "8px 12px", // Un poco más compacto
                borderRadius: "12px",
                maxWidth: "85%",
                fontSize: "13px", // Fuente ligeramente más pequeña para rapidez visual
                lineHeight: "1.4",
                border:
                  msg.role === "user"
                    ? "none"
                    : "1px solid var(--color-border)",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: "flex", gap: 10 }}>
            <Loader2
              size={16}
              className="animate-spin"
              color="var(--color-text-muted)"
            />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "12px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pregunta sobre tus datos..."
          style={{
            flex: 1,
            padding: "10px",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: 13,
            color: "var(--color-text-primary)",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            background: "var(--color-accent)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
