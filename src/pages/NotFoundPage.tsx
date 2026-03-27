import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-base)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <h1
        style={{
          fontSize: 64,
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      >
        404
      </h1>
      <p style={{ color: "var(--color-text-secondary)" }}>
        Esta página no existe.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Volver al dashboard</Button>
      </Link>
    </div>
  );
}
