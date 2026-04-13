import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Bot, User, X } from "lucide-react";
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
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: isUser
            ? "var(--color-accent-dim)"
            : "var(--color-bg-elevated)",
          border: `1px solid ${isUser ? "var(--color-accent)" : "var(--color-border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <User size={14} color="var(--color-accent)" />
        ) : (
          <Bot size={14} color="var(--color-text-secondary)" />
        )}
      </div>

      <div
        style={{
          maxWidth: "80%",
          padding: "10px 14px",
          borderRadius: "14px",
          borderTopRightRadius: isUser ? "4px" : "14px",
          borderTopLeftRadius: !isUser ? "4px" : "14px",
          background: isUser
            ? "var(--color-accent)"
            : "var(--color-bg-elevated)",
          border: isUser ? "none" : "1px solid var(--color-border)",
          fontSize: 13,
          color: isUser ? "white" : "var(--color-text-primary)",
          lineHeight: 1.5,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
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
  const [isOpen, setIsOpen] = useState(false); // 🔴 Memoria para saber si la ventana está abierta
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking, isOpen]);

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
        content: "No pude conectar con el servidor. Comprueba la conexión.",
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
    <>
      {/* 🔴 EL BOTÓN FLOTANTE (La "Bolita") */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, var(--color-accent) 0%, #9333ea 100%)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 8px 25px rgba(124, 58, 237, 0.4)",
          zIndex: 50,
          transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          transform: isOpen
            ? "scale(0.9) rotate(90deg)"
            : "scale(1) rotate(0deg)",
        }}
      >
        {isOpen ? (
          <X size={24} color="white" />
        ) : (
          <MessageSquare size={24} color="white" />
        )}
      </button>

      {/* 🔴 LA VENTANA DEL CHAT */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 100, // Justo encima del botón flotante
            right: 30,
            width: 350,
            height: 500,
            background: "rgba(10, 10, 15, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--color-border)",
            borderRadius: 20,
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)",
            display: "flex",
            flexDirection: "column",
            zIndex: 49,
            overflow: "hidden",
            animation: "fadeSlideUp 0.3s ease-out forwards",
          }}
        >
          {/* Cabecera del Chat */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 20px",
              background: "rgba(124, 58, 237, 0.1)",
              borderBottom: "1px solid rgba(124, 58, 237, 0.2)",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={18} color="white" />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                Consultor IA
              </h3>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-accent)",
                  margin: "2px 0 0",
                }}
              >
                En línea • Analizando tus datos
              </p>
            </div>
          </div>

          {/* Zona de Mensajes */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
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
                  gap: 12,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "var(--color-bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageSquare size={24} color="var(--color-text-muted)" />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                      margin: "0 0 4px",
                    }}
                  >
                    ¿En qué puedo ayudarte?
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    Pregúntame sobre tendencias, gastos o consejos para llegar a
                    tu meta.
                  </p>
                </div>
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
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--color-bg-elevated)",
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={14} color="var(--color-text-secondary)" />
                    </div>
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "14px",
                        borderTopLeftRadius: "4px",
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

          {/* Caja de Escritura */}
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid var(--color-border)",
              background: "rgba(10, 10, 15, 0.95)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--color-bg-base)",
                border: "1px solid var(--color-border-hover)",
                padding: "4px 4px 4px 16px",
                borderRadius: "24px",
              }}
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu consulta..."
                disabled={isThinking || rows.length === 0}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-primary)",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking || rows.length === 0}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background:
                    input.trim() && !isThinking
                      ? "var(--color-accent)"
                      : "transparent",
                  border: "none",
                  cursor: input.trim() && !isThinking ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                <Send
                  size={16}
                  color={
                    input.trim() && !isThinking
                      ? "white"
                      : "var(--color-text-muted)"
                  }
                  style={{ marginLeft: input.trim() && !isThinking ? 2 : 0 }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
