import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Send,
  Bot,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { BASE_URL } from "../../services/api.service";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
}

export function AiDocumentAnalyst() {
  const { token } = useAuthStore(); // Sacamos la llave de seguridad para el Backend
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null); // El DNI del documento

  const [isReading, setIsReading] = useState(false);
  const [isChatReady, setIsChatReady] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ─── 1. ENVIAMOS EL PDF AL SERVIDOR REAL ───
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsReading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await fetch(
          `${BASE_URL}/api/ai/upload-pdf`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, // Tu token de seguridad
            },
            body: formData,
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error al subir el archivo");
        }

        // Guardamos el ID que nos da el Backend
        setDocumentId(data.documentId);
        setIsChatReady(true);
        setMessages([
          {
            id: "msg-1",
            role: "ai",
            text: `¡Hola! Acabo de leer el documento "${selectedFile.name}". Lo tengo todo en mi memoria. ¿Qué necesitas saber sobre él?`,
          },
        ]);
      } catch (error) {
        console.error("Error subiendo PDF:", error);
        setUploadError(
          error instanceof Error
            ? error.message
            : "Error de conexión con el servidor",
        );
        setFile(null);
      } finally {
        setIsReading(false);
      }
    }
  };

  // ─── 2. HACEMOS LA PREGUNTA A LA IA (GROQ) EN EL SERVIDOR ───
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !documentId) return;

    const userText = inputValue;
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentId: documentId,
          question: userText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar respuesta");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: data.answer, // <-- AQUÍ RECIBIMOS LA RESPUESTA REAL DE LLAMA3
        },
      ]);
    } catch (error) {
      console.error("Error en chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "Lo siento, ha ocurrido un error al procesar tu pregunta en el servidor. Asegúrate de que el Backend está encendido.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ─── INTERFAZ FASE 1: SUBIR EL DOCUMENTO ───
  if (!isChatReady) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: 800,
          margin: "0 auto",
          width: "100%",
          animation: "fadeSlideUp 0.4s ease-out",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: 8,
            }}
          >
            Analista de Documentos IA
          </h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
            Sube reportes, balances o contratos en formato PDF. Nuestra IA lo
            leerá en segundos y podrás hacerle preguntas directamente.
          </p>
        </div>

        <div
          onClick={() =>
            !isReading && document.getElementById("pdf-upload")?.click()
          }
          style={{
            border: `2px dashed ${uploadError ? "var(--color-danger)" : "var(--color-border-hover)"}`,
            borderRadius: "var(--radius-xl)",
            padding: "60px 20px",
            textAlign: "center",
            background: "var(--color-bg-card)",
            cursor: isReading ? "wait" : "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            transition: "all 0.3s",
          }}
        >
          <input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            disabled={isReading}
          />

          {isReading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <Loader2
                size={40}
                className="animate-spin"
                color="var(--color-accent)"
              />
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--color-accent)",
                }}
              >
                Enviando documento al servidor y analizando...
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: uploadError
                    ? "var(--color-danger-dim)"
                    : "var(--color-bg-elevated)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: uploadError
                    ? "var(--color-danger)"
                    : "var(--color-accent)",
                }}
              >
                {uploadError ? (
                  <AlertCircle size={32} />
                ) : (
                  <FileText size={32} />
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {uploadError
                    ? "Error al subir el archivo"
                    : "Sube tu documento PDF aquí"}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: uploadError
                      ? "var(--color-danger)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {uploadError || "Soporta formato .PDF"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── INTERFAZ FASE 2: CHAT CON LA IA ───
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 180px)",
        background: "var(--color-bg-card)",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        animation: "fadeSlideUp 0.4s ease-out",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg-elevated)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              Asesor Financiero IA
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <CheckCircle size={12} /> Documento procesado: {file?.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsChatReady(false);
            setFile(null);
            setDocumentId(null);
            setMessages([]);
          }}
          style={{
            padding: "8px 16px",
            background: "transparent",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text-secondary)",
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Subir otro archivo
        </button>
      </div>

      <div
        style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
        className="custom-scrollbar"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              gap: 16,
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background:
                  msg.role === "user"
                    ? "var(--color-bg-elevated)"
                    : "rgba(124, 106, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color:
                  msg.role === "user"
                    ? "var(--color-text-secondary)"
                    : "var(--color-accent)",
                flexShrink: 0,
              }}
            >
              {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div
              style={{
                background:
                  msg.role === "user"
                    ? "var(--color-accent)"
                    : "var(--color-bg-elevated)",
                color:
                  msg.role === "user" ? "white" : "var(--color-text-primary)",
                padding: "12px 16px",
                borderRadius: "16px",
                borderTopRightRadius: msg.role === "user" ? 0 : 16,
                borderTopLeftRadius: msg.role === "ai" ? 0 : 16,
                maxWidth: "75%",
                fontSize: 14,
                lineHeight: 1.6,
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
          <div style={{ display: "flex", gap: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(124, 106, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
              }}
            >
              <Bot size={18} />
            </div>
            <div
              style={{
                background: "var(--color-bg-elevated)",
                padding: "12px 16px",
                borderRadius: "16px",
                borderTopLeftRadius: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--color-border)",
              }}
            >
              <Loader2
                size={16}
                className="animate-spin"
                color="var(--color-text-muted)"
              />
              <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                Procesando en el servidor...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-bg-surface)",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pregúntame algo sobre el documento..."
            disabled={isTyping}
            style={{
              flex: 1,
              padding: "14px 16px",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-primary)",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            style={{
              padding: "0 24px",
              background:
                inputValue.trim() && !isTyping
                  ? "var(--color-accent)"
                  : "var(--color-bg-elevated)",
              color:
                inputValue.trim() && !isTyping
                  ? "white"
                  : "var(--color-text-muted)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor:
                inputValue.trim() && !isTyping ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
