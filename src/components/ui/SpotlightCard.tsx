import { useRef, type CSSProperties, type ReactNode } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function SpotlightCard({
  children,
  style,
  className = "",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Magia directa al DOM: La luz sigue al ratón
    glowRef.current.style.background = `radial-gradient(350px circle at ${x}px ${y}px, rgba(139, 92, 246, 0.15), transparent 50%)`;
    glowRef.current.style.opacity = "1";

    // Efecto de elevación al pasar el ratón
    cardRef.current.style.borderColor = "rgba(139, 92, 246, 0.4)";
    cardRef.current.style.transform = "translateY(-2px)";
    cardRef.current.style.boxShadow =
      "0 10px 30px -10px rgba(139, 92, 246, 0.3)";
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !glowRef.current) return;
    // Apagamos la luz cuando el ratón se va
    glowRef.current.style.opacity = "0";
    cardRef.current.style.borderColor = "var(--color-border)";
    cardRef.current.style.transform = "translateY(0)";
    cardRef.current.style.boxShadow = "none";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        position: "relative",
        background: "var(--color-bg-card)", // Fondo translúcido
        backdropFilter: "blur(16px)", // Efecto cristal real
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition:
          "border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
        ...style,
      }}
    >
      {/* CAPA 1: La luz del Spotlight */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.3s ease",
          zIndex: 1,
        }}
      />

      {/* CAPA 2: Tu contenido */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
