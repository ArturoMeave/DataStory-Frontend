import React from "react";

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

const glowMap: Record<GlowColor, string> = {
  none: "none",
  accent: "0 0 28px var(--color-accent-dim)",
  success: "0 0 28px var(--color-success-dim)",
  danger: "0 0 28px var(--color-danger-dim)",
  warning: "0 0 28px var(--color-warning-dim)",
};

const paddingMap: Record<Padding, string> = {
  none: "0",
  sm: "14px",
  md: "20px",
  lg: "28px",
};

export function Card({
  children,
  className = "",
  glow = "none",
  padding = "md",
  style,
  id,
  onClick,
}: CardProps) {
  return (
    <div
      id={id}
      className={className}
      onClick={onClick}
      style={{
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: paddingMap[padding],
        boxShadow: glowMap[glow],
        transition: "box-shadow 0.3s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
