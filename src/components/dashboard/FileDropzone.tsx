import { useState, useCallback } from "react";
import { FileSpreadsheet, Upload, AlertCircle } from "lucide-react";
import { parseCSVFile } from "../../utils/csvParser";
import { useDataStore } from "../../stores/dataStore";

export function FileDropzone() {
  const { setRows } = useDataStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      const isCSV = file.name.endsWith(".csv") || file.type === "text/csv";
      if (!isCSV) {
        setError("Por ahora solo se admiten archivos .CSV.");
        setIsProcessing(false);
        return;
      }

      try {
        const rows = await parseCSVFile(file);
        setRows(rows);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error desconocido al leer el archivo.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [setRows],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Grid decorativo de fondo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(var(--color-accent) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
        }}
      >
        {/* Título */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              marginBottom: 12,
            }}
          >
            Tu analista de datos personal
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            Sube tu CSV y convierte números aburridos en decisiones
            inteligentes.
          </p>
        </div>

        {/* Zona de drop */}
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{ display: "block", cursor: "pointer" }}
        >
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "48px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              transition: "all 0.2s ease",
              background: isDragging
                ? "var(--color-accent-dim)"
                : "var(--color-bg-card)",
              border: `2px dashed ${isDragging ? "var(--color-accent)" : "var(--color-border-hover)"}`,
              transform: isDragging ? "scale(1.01)" : "scale(1)",
            }}
          >
            {/* Icono */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-lg)",
                background: "var(--color-accent-dim)",
                border: "1px solid var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isProcessing ? (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: "2px solid var(--color-accent)",
                    borderTopColor: "transparent",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <FileSpreadsheet size={28} color="var(--color-accent)" />
              )}
            </div>

            {/* Texto */}
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: 4,
                }}
              >
                {isProcessing ? "Leyendo archivo..." : "Arrastra tu CSV aquí"}
              </p>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                o haz clic para seleccionarlo
              </p>
            </div>

            {/* Badge de formato */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "var(--color-bg-elevated)",
                  color: "var(--color-text-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                .CSV
              </span>
            </div>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileInput}
              disabled={isProcessing}
              style={{ display: "none" }}
            />
          </div>
        </label>

        {/* Error */}
        {error && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--color-danger-dim)",
              border: "1px solid var(--color-danger)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <AlertCircle
              size={15}
              color="var(--color-danger)"
              style={{ marginTop: 1, flexShrink: 0 }}
            />
            <p
              style={{
                fontSize: 13,
                color: "var(--color-danger)",
                lineHeight: 1.5,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {/* Hint de formato */}
        <div
          style={{
            marginTop: 16,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <Upload size={12} color="var(--color-text-muted)" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-text-secondary)",
              }}
            >
              Formato esperado
            </span>
          </div>
          <code
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            date, revenue, expenses, label (opcional)
          </code>
        </div>
      </div>
    </div>
  );
}
