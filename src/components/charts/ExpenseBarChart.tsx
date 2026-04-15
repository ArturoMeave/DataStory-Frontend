import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Rectangle,
} from "recharts";
import { useDataStore } from "../../stores/dataStore";
import { formatCurrency } from "../../utils/dataAggregator";
import { ChartContainer } from "./ChartContainer";

const COLORS = {
  bar: "rgba(34,211,160,0.25)",
  barStroke: "#22d3a0",
  grid: "rgba(255,255,255,0.04)",
  axis: "#4a4a6a",
  tooltip: "#16161f",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: COLORS.tooltip,
        border: "1px solid var(--color-border-hover)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        minWidth: 160,
      }}
    >
      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.barStroke }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function ExpenseBarChart() {
  const { rows } = useDataStore();
  const chartData = rows.map((row, index) => ({ ...row, _index: index }));

  return (
    <ChartContainer
      id="chart-expenses"
      title="Gastos por período"
      subtitle="Histórico de gastos consolidados"
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
              <stop
                offset="5%"
                stopColor={COLORS.barStroke}
                stopOpacity={0.6}
              />
              <stop
                offset="95%"
                stopColor={COLORS.barStroke}
                stopOpacity={0.1}
              />
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
          <Bar
            dataKey="expenses"
            radius={[3, 3, 0, 0]}
            activeBar={
              <Rectangle
                fill="var(--color-accent)"
                stroke="#fff"
                strokeWidth={2}
                style={{
                  filter: "drop-shadow(0px 0px 8px var(--color-accent-dim))",
                  transform: "scaleY(1.05)",
                  transformOrigin: "bottom",
                }}
              />
            }
          >
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill="url(#colorBar)"
                stroke={COLORS.barStroke}
                strokeWidth={1}
                style={{ transition: "opacity 0.2s", opacity: 0.8 }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
