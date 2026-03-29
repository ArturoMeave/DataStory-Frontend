import React from "react";
import { Card } from "../ui/Card";

interface ChartContainerProps {
  id?: string;
  title: string;
  subtitle?: string;
  height?: number;
  children: React.ReactNode;
}

export function ChartContainer({
  id,
  title,
  subtitle,
  height = 280,
  children,
}: ChartContainerProps) {
  return (
    <Card id={id} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: 2,
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ width: "100%", height }}>{children}</div>
    </Card>
  );
}
