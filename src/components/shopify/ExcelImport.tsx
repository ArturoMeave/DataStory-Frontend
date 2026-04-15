import { useState, useCallback } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useDataStore } from "../../stores/dataStore";
import { useShopifyStore } from "../../stores/shopifyStore";
// 1. IMPORTAMOS TU FUNCIÓN CON EL NOMBRE CORRECTO
import { parseCSVFile } from "../../utils/csvParser";

export function ExcelImport() {
  const { token } = useAuthStore();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { setRows } = useDataStore();
  const { setActiveView } = useShopifyStore();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelection = (selectedFile: File) => {
    setStatus("idle");
    setErrorMsg("");

    // Filtro de seguridad inicial
    if (
      selectedFile.type === "text/csv" ||
      selectedFile.name.endsWith(".csv") ||
      selectedFile.name.endsWith(".xlsx")
    ) {
      setFile(selectedFile);
    } else {
      setStatus("error");
      setErrorMsg("Formato no válido. Por favor sube un archivo CSV o Excel.");
    }
  };

  const handleProcessData = async () => {
    if (!file) return;
    setStatus("loading");

    try {
      // SI ES UN CSV
      if (file.name.endsWith(".csv")) {
        const parsedData = await parseCSVFile(file);

        await fetch("http://localhost:3001/api/workspace/data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: parsedData }),
        });

        // Guardamos los datos en el cerebro de la web
        setRows(parsedData);
        setStatus("success");

        // 🎇 MAGIA: Después de 1.5 segundos, lo llevamos al Dashboard para que vea sus gráficas
        setTimeout(() => {
          setActiveView("overview");
        }, 1500);
      }
      // SI ES UN EXCEL (.xlsx)
      else {
        setTimeout(() => {
          setStatus("error");
          setErrorMsg(
            "La lectura nativa de .xlsx requiere el backend. Por favor, guarda tu Excel como .CSV y súbelo.",
          );
        }, 2000);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Error al procesar el archivo.",
      );
    }
  };

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
          Importador Universal
        </h2>
        <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          Sube tus archivos financieros (formato CSV). Nuestro motor leerá las
          columnas, extraerá las métricas y construirá un Dashboard interactivo
          automáticamente.
        </p>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragging ? "var(--color-accent)" : status === "error" ? "var(--color-danger)" : "var(--color-border-hover)"}`,
          borderRadius: "var(--radius-xl)",
          padding: "60px 20px",
          textAlign: "center",
          background: isDragging
            ? "var(--color-accent-dim)"
            : "var(--color-bg-card)",
          transition: "all 0.2s ease",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept=".csv, .xlsx"
          style={{ display: "none" }}
          onChange={(e) =>
            e.target.files && handleFileSelection(e.target.files[0])
          }
        />

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: isDragging
              ? "var(--color-accent)"
              : "var(--color-bg-elevated)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            color: isDragging ? "white" : "var(--color-accent)",
          }}
        >
          <UploadCloud size={32} />
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
            {isDragging ? "¡Suéltalo aquí!" : "Haz clic o arrastra tu archivo"}
          </p>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
            Soporta formato .CSV (Recomendado)
          </p>
        </div>
      </div>

      {/* TARJETA DEL ARCHIVO SELECCIONADO */}
      {file && (
        <div
          style={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            animation: "fadeSlideUp 0.3s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(124,106,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
              }}
            >
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {file.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            onClick={handleProcessData}
            disabled={status === "loading" || status === "success"}
            style={{
              padding: "10px 24px",
              background:
                status === "success"
                  ? "var(--color-success)"
                  : "var(--color-accent)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              cursor:
                status === "loading" || status === "success"
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
          >
            {status === "idle" || status === "error"
              ? "Procesar Archivo"
              : null}
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Analizando...
              </>
            ) : null}
            {status === "success" ? (
              <>
                <CheckCircle size={16} /> ¡Completado!
              </>
            ) : null}
          </button>
        </div>
      )}

      {/* MENSAJE DE ERROR */}
      {status === "error" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 16,
            background: "var(--color-danger-dim)",
            border: "1px solid var(--color-danger)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-danger)",
            fontSize: 14,
            animation: "fadeSlideUp 0.3s ease-out",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
