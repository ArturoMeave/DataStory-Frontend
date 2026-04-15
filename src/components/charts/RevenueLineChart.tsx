import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useDataStore } from "../../stores/dataStore";
import { formatCurrency } from "../../utils/dataAggregator";
import { ChartContainer } from "./ChartContainer";
import type { ChartDataPoint } from "../../types";

const COLORS = {
  line: "#7c6aff",
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
      <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.line }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function RevenueLineChart() {
  const { rows } = useDataStore();
  const chartData: ChartDataPoint[] = rows.map((row, index) => ({
    ...row,
    index,
  }));

  return (
    <ChartContainer
      id="chart-revenue"
      title="Ingresos"
      subtitle={`${rows.length} períodos registrados`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.line} stopOpacity={0.4} />
              <stop offset="95%" stopColor={COLORS.line} stopOpacity={0} />
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
            cursor={{
              stroke: "rgba(255,255,255,0.15)",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.line}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            strokeWidth={2}
            activeDot={{
              r: 7,
              fill: COLORS.line,
              stroke: "#fff",
              strokeWidth: 2,
              style: {
                filter: "drop-shadow(0px 0px 8px rgba(124,106,255,0.8))",
              },
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
