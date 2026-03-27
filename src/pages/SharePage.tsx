import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { ShareBanner } from "../components/layout/ShareBanner";
import { useDataStore } from "../stores/dataStore";

export function SharePage() {
  const { id } = useParams<{ id: string }>();
  const { setIsReadOnly } = useDataStore();

  useEffect(() => {
    setIsReadOnly(true);
    return () => setIsReadOnly(false);
  }, [setIsReadOnly]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-base)" }}>
      <Navbar />
      <ShareBanner />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
        <p style={{ color: "var(--color-text-muted)" }}>ID compartido: {id}</p>
      </main>
    </div>
  );
}
