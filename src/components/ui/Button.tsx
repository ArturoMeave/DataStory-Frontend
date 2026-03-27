import React from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--color-accent)",
    color: "#ffffff",
    border: "1px solid transparent",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-secondary)",
    border: "1px solid transparent",
  },
  outline: {
    background: "transparent",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-hover)",
  },
  danger: {
    background: "var(--color-danger-dim)",
    color: "var(--color-danger)",
    border: "1px solid var(--color-danger)",
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: 12, gap: 5 },
  md: { padding: "8px 16px", fontSize: 13, gap: 6 },
  lg: { padding: "12px 24px", fontSize: 15, gap: 8 },
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  const hoverOverlay: React.CSSProperties =
    variant === "primary" && hovered
      ? { background: "var(--color-accent-hover)" }
      : variant === "ghost" && hovered
        ? {
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-primary)",
          }
        : variant === "outline" && hovered
          ? { borderColor: "var(--color-accent)", color: "var(--color-accent)" }
          : variant === "danger" && hovered
            ? { background: "var(--color-danger)", color: "#fff" }
            : {};

  return (
    <button
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        fontWeight: 500,
        borderRadius: "var(--radius-md)",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.45 : 1,
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
        userSelect: "none",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...hoverOverlay,
        ...style,
      }}
      {...props}
    >
      {loading && (
        <Loader2
          size={size === "sm" ? 12 : 14}
          style={{ animation: "spin 1s linear infinite" }}
        />
      )}
      {children}
    </button>
  );
}
