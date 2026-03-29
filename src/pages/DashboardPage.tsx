import { Navbar } from "../components/layout/Navbar";
import { FileDropzone } from "../components/dashboard/FileDropzone";
import { useDataStore } from "../stores/dataStore";

export function DashboardPage() {
  const { rows } = useDataStore();
  const hasData = rows.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <Navbar />
      {!hasData ? (
        <FileDropzone />
      ) : (
        <main
          style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}
        >
          <p style={{ color: "var(--color-text-primary)" }}>
            {rows.length} filas cargadas. Los gráficos llegan en el Paso 6.
          </p>
        </main>
      )}
    </div>
  );
}
