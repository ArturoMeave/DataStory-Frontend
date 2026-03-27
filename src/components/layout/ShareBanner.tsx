import { Eye } from "lucide-react";

export function ShareBanner() {
  return (
    <div
      style={{
        width: "100%",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "var(--color-warning-dim)",
        borderBottom: "1px solid rgba(245,158,11,0.25)",
        color: "var(--color-warning)",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      <Eye size={14} />
      Estás viendo un dashboard compartido en modo solo lectura. No puedes
      editar ni exportar datos.
    </div>
  );
}
