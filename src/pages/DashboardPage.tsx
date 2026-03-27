import { Navbar } from "../components/layout/Navbar";

export function DashboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
        <h1 style={{ color: "var(--color-text-primary)" }}>
          Dashboard — Paso 3 Listo
        </h1>
      </main>
    </div>
  );
}
