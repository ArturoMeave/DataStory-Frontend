import React from "react";

type BadgeVariant = "accent" | "success" | "warning" | "danger" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const styles: Record<BadgeVariant, React.CSSProperties> = {
  accent: {
    background: "var(--color-accent-dim)",
    color: "var(--color-accent)",
    border: "1px solid rgba(124,106,255,0.25)",
  },
  success: {
    background: "var(--color-success-dim)",
    color: "var(--color-success)",
    border: "1px solid rgba(34,211,160,0.25)",
  },
  warning: {
    background: "var(--color-warning-dim)",
    color: "var(--color-warning)",
    border: "1px solid rgba(245,158,11,0.25)",
  },
  danger: {
    background: "var(--color-danger-dim)",
    color: "var(--color-danger)",
    border: "1px solid rgba(244,63,94,0.25)",
  },
  neutral: {
    background: "var(--color-bg-elevated)",
    color: "var(--color-text-muted)",
    border: "1px solid var(--color-border)",
  },
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        border: "1px solid",
        whiteSpace: "nowrap",
        ...styles[variant],
      }}
    >
      {children}
    </span>
  );
}
