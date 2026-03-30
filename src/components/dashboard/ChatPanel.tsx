import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Bot, User } from "lucide-react";
import { Card } from "../ui/Card";
import { useDataStore } from "../../stores/dataStore";
import { chatWithData } from "../../services/api.service";
import { buildDataSummary } from "../../utils/dataAggregator";
import type { ChatMessage } from "../../types";

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: isUser
            ? "var(--color-accent-dim)"
            : "var(--color-bg-elevated)",
          border: `1px solid ${isUser ? "var(--color-accent)" : "var(--color-border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {isUser ? (
          <User size={12} color="var(--color-accent)" />
        ) : (
          <Bot size={12} color="var(--color-text-secondary)" />
        )}
      </div>

      {/* Burbuja */}
      <div
        style={{
          maxWidth: "80%",
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          background: isUser
            ? "var(--color-accent-dim)"
            : "var(--color-bg-elevated)",
          border: `1px solid ${isUser ? "rgba(124,106,255,0.3)" : "var(--color-border)"}`,
          fontSize: 13,
          color: "var(--color-text-primary)",
          lineHeight: 1.6,
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

export function ChatPanel() {
  const { rows, goal, chatHistory, addChatMessage } = useDataStore();
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isThinking || rows.length === 0) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: Date.now(),
    };

    addChatMessage(userMessage);
    setInput("");
    setIsThinking(true);

    try {
      const dataSummary = buildDataSummary(rows, goal?.amount);
      const recentHistory = chatHistory.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatWithData(question, dataSummary, recentHistory);

      addChatMessage({
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: Date.now(),
      });
    } catch {
      addChatMessage({
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "No pude conectar con el servidor. Comprueba que el backend está corriendo.",
        timestamp: Date.now(),
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card
      padding="none"
      style={{ display: "flex", flexDirection: "column", height: 380 }}
    >
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <MessageSquare size={15} color="var(--color-accent)" />
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text-primary)",
          }}
        >
          Chat con tus datos
        </span>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {chatHistory.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <Bot size={24} color="var(--color-text-muted)" />
            <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              Pregúntame sobre tus datos
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                opacity: 0.6,
              }}
            >
              Ej: "¿Cuál fue mi mejor mes?"
            </p>
          </div>
        ) : (
          <>
            {chatHistory.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isThinking && (
              <div style={{ display: "flex", gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={12} color="var(--color-text-secondary)" />
                </div>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--color-text-muted)",
                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: 8,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            rows.length === 0
              ? "Carga un CSV primero..."
              : "Pregunta sobre tus datos..."
          }
          disabled={isThinking || rows.length === 0}
          style={{
            flex: 1,
            padding: "8px 12px",
            fontSize: 13,
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-primary)",
            outline: "none",
            fontFamily: "var(--font-sans)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-accent)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isThinking || rows.length === 0}
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            background:
              input.trim() && !isThinking
                ? "var(--color-accent)"
                : "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            cursor: input.trim() && !isThinking ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
            flexShrink: 0,
            opacity: !input.trim() || isThinking ? 0.4 : 1,
          }}
        >
          <Send size={13} color="white" />
        </button>
      </div>
    </Card>
  );
}
