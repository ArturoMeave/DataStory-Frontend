import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDataStore } from "../../stores/dataStore";
import { isAnomalyIndex } from "../../utils/anomalyDetector";
import { formatCurrency } from "../../utils/dataAggregator";
import { ChartContainer } from "./ChartContainer";

const COLORS = {
  bar: "rgba(34,211,160,0.25)",
  barStroke: "#22d3a0",
  anomalyBar: "rgba(244,63,94,0.25)",
  anomalyStroke: "#f43f5e",
  grid: "rgba(255,255,255,0.04)",
  axis: "#4a4a6a",
  tooltip: "#16161f",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const isAnomaly = payload[0]?.payload?._isAnomaly;

  return (
    <div
      style={{
        background: COLORS.tooltip,
        border: `1px solid ${isAnomaly ? COLORS.anomalyStroke : "var(--color-border-hover)"}`,
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        minWidth: 160,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <p style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          {label}
        </p>
        {isAnomaly && (
          <span
            style={{
              fontSize: 10,
              padding: "1px 6px",
              borderRadius: 10,
              background: "var(--color-danger-dim)",
              color: "var(--color-danger)",
            }}
          >
            Anomalía
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: isAnomaly ? COLORS.anomalyStroke : COLORS.barStroke,
        }}
      >
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function ExpenseBarChart() {
  const { rows, anomalies } = useDataStore();

  // Enriquecemos cada fila con metadatos para que Cell pueda usarlos
  const chartData = rows.map((row, index) => ({
    ...row,
    _index: index,
    _isAnomaly: isAnomalyIndex(anomalies, index),
  }));

  return (
    <ChartContainer
      id="chart-expenses"
      title="Gastos por período"
      subtitle="Las barras rojas indican picos estadísticamente inusuales"
      height={220}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
          barSize={20}
        >
          <defs>
            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.barStroke} stopOpacity={0.6} />
              <stop offset="95%" stopColor={COLORS.barStroke} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.anomalyStroke} stopOpacity={0.6} />
              <stop offset="95%" stopColor={COLORS.anomalyStroke} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLORS.grid}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: COLORS.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              new Intl.NumberFormat("es-ES", {
                notation: "compact",
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(v)
            }
            width={64}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.02)" }}
          />
          <Bar dataKey="expenses" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry._isAnomaly ? "url(#colorAnomaly)" : "url(#colorBar)"}
                stroke={
                  entry._isAnomaly ? COLORS.anomalyStroke : COLORS.barStroke
                }
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
