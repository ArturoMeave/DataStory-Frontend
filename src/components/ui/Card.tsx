import React from "react";
import { SpotlightCard } from "./SpotlightCard";

type GlowColor = "none" | "accent" | "success" | "danger" | "warning";
type Padding = "none" | "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: GlowColor;
  padding?: Padding;
  style?: React.CSSProperties;
  id?: string;
  onClick?: () => void;
}

const paddingMap: Record<Padding, string> = {
  none: "0",
  sm: "12px",
  md: "16px", // Reducido (antes era 20)
  lg: "20px", // Reducido (antes era 28)
};

export function Card({
  children,
  className = "",
  padding = "md",
  style,
  id,
  onClick,
}: CardProps) {
  // Ahora TODAS las tarjetas de tu app son magnéticas y compactas automáticamente
  return (
    <div id={id} onClick={onClick} style={{ height: "100%" }}>
      <SpotlightCard
        className={className}
        style={{
          padding: paddingMap[padding],
          height: "100%",
          display: "flex",
          flexDirection: "column",
          ...style,
        }}
      >
        {children}
      </SpotlightCard>
    </div>
  );
}
