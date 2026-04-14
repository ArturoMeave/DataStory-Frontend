import { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

export function ExcelImport() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const isValid = validExtensions.some((ext) =>
      selectedFile.name.toLowerCase().endsWith(ext),
    );

    if (isValid) {
      setFile(selectedFile);
      setUploadStatus("idle");
    } else {
      setFile(null);
      setUploadStatus("error");
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);

    setTimeout(() => {
      setIsUploading(false);
      setUploadStatus("success");
    }, 2500);
  };

  const resetUploader = () => {
    setFile(null);
    setUploadStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: 800,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: "0 0 8px 0",
          }}
        >
          Importar Datos Externos
        </h2>
        <p
          style={{ color: "var(--color-text-muted)", margin: 0, fontSize: 15 }}
        >
          Sube tu historial de ventas offline, reportes de mayoristas o
          inventario en formato CSV o Excel para unificar tus métricas.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${file ? "var(--color-accent)" : "var(--color-border)"}`,
          borderRadius: 16,
          padding: "60px 24px",
          textAlign: "center",
          background: file ? "rgba(168,85,247,0.02)" : "var(--color-bg-card)",
          transition: "all 0.2s ease",
          cursor: "pointer",
        }}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          style={{ display: "none" }}
        />

        {!file ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--color-bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadCloud size={32} color="var(--color-text-muted)" />
            </div>
            <div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: "0 0 8px 0",
                }}
              >
                Haz clic o arrastra un archivo aquí
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                Soporta archivos .CSV y .XLSX (Máximo 10MB)
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <FileSpreadsheet size={48} color="var(--color-accent)" />
            <div>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: "0 0 4px 0",
                }}
              >
                {file.name}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                  margin: 0,
                }}
              >
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {uploadStatus === "idle" && !isUploading && (
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUploader();
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "transparent",
                    color: "var(--color-text-primary)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  style={{
                    padding: "8px 24px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--color-accent)",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Procesar Archivo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isUploading && (
        <div
          style={{
            background: "var(--color-bg-card)",
            padding: 24,
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          <div className="spinner" style={{ margin: "0 auto 16px auto" }}>
            ⏳
          </div>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Analizando filas y limpiando datos...
          </p>
        </div>
      )}

      {uploadStatus === "success" && (
        <div
          style={{
            background: "rgba(34,197,94,0.1)",
            padding: 24,
            borderRadius: 12,
            border: "1px solid rgba(34,197,94,0.2)",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <CheckCircle2 size={24} color="#22c55e" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: "0 0 4px 0", color: "#22c55e", fontSize: 16 }}>
              ¡Importación Completada!
            </h4>
            <p
              style={{
                margin: 0,
                color: "var(--color-text-secondary)",
                fontSize: 14,
              }}
            >
              Los datos se han fusionado correctamente con tu base de datos de
              Shopify. Las gráficas de Analytics se han actualizado.
            </p>
          </div>
          <button
            onClick={resetUploader}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
            }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {uploadStatus === "error" && (
        <div
          style={{
            background: "rgba(244,63,94,0.1)",
            padding: 24,
            borderRadius: 12,
            border: "1px solid rgba(244,63,94,0.2)",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          <AlertCircle size={24} color="#f43f5e" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: "0 0 4px 0", color: "#f43f5e", fontSize: 16 }}>
              Formato no válido
            </h4>
            <p
              style={{
                margin: 0,
                color: "var(--color-text-secondary)",
                fontSize: 14,
              }}
            >
              Por favor, asegúrate de subir un archivo de Excel (.xlsx) o un
              archivo separado por comas (.csv).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
