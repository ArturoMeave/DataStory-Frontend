import React from "react";
import { SpotlightCard } from "../ui/SpotlightCard";

interface ChartContainerProps {
  id?: string;
  title: string;
  subtitle?: string;
  height?: number;
  children: React.ReactNode; // ¡Esto es lo que faltaba! El hueco para el gráfico
}

export function ChartContainer({
  title,
  subtitle,
  height = 300,
  children,
}: ChartContainerProps) {
  return (
    <SpotlightCard style={{ width: "100%", overflow: "visible" }}>
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          // Le damos la altura que pide el gráfico + espacio para el título
          height: height + 80,
        }}
      >
        {/* Cabecera del gráfico */}
        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
                margin: "4px 0 0 0",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* El lienzo donde Recharts dibujará sin aplastarse */}
        <div style={{ flex: 1, minHeight: 0, width: "100%" }}>{children}</div>
      </div>
    </SpotlightCard>
  );
}
