import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import { useDataStore } from "../../stores/dataStore";
import { generateForecast } from "../../utils/forecastEngine";
import { formatCurrency } from "../../utils/dataAggregator";
import { ChartContainer } from "./ChartContainer";
import type { ChartDataPoint } from "../../types";

const COLORS = {
  line: "#7c6aff",
  forecast: "#7c6aff88",
  grid: "rgba(255,255,255,0.04)",
  axis: "#4a4a6a",
  tooltip: "#16161f",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const isForecast = payload[0]?.payload?.isForecast;

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
        {isForecast && (
          <span
            style={{
              fontSize: 10,
              padding: "1px 6px",
              borderRadius: 10,
              background: "var(--color-accent-dim)",
              color: "var(--color-accent)",
            }}
          >
            Predicción
          </span>
        )}
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: COLORS.line }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

function CustomDot(props: any) {
  const { cx, cy, payload, anomalyIndices } = props;

  if (payload?.isForecast) return null;

  const isAnomaly = anomalyIndices.has(payload?.index);
  if (!isAnomaly) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="#f43f5e" opacity={0.2} />
      <circle cx={cx} cy={cy} r={4} fill="#f43f5e" />
    </g>
  );
}

export function RevenueLineChart() {
  const { rows, anomalies } = useDataStore();

  const forecastPoints = generateForecast(rows);

  const chartData: ChartDataPoint[] = [
    ...rows.map((row, index) => ({ ...row, index })),
    ...forecastPoints,
  ];

  const anomalyIndices = new Set(
    anomalies.filter((a) => a.type === "revenue").map((a) => a.index),
  );

  const realDataLength = rows.length;

  return (
    <ChartContainer
      id="chart-revenue"
      title="Ingresos"
      subtitle={`${rows.length} períodos reales · 3 meses proyectados`}
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
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.forecast} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.forecast} stopOpacity={0} />
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
            dot={(props: any) => (
              <CustomDot {...props} anomalyIndices={anomalyIndices} />
            )}
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

          {forecastPoints.length > 0 && (
            <Area
              type="monotone"
              dataKey="revenue"
              data={[
                { ...rows[realDataLength - 1], index: realDataLength - 1 },
                ...forecastPoints,
              ]}
              stroke={COLORS.forecast}
              fillOpacity={1}
              fill="url(#colorForecast)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{
                r: 6,
                fill: COLORS.forecast,
                stroke: "#fff",
                strokeWidth: 1,
                style: {
                  filter: "drop-shadow(0px 0px 6px rgba(124,106,255,0.5))",
                },
              }}
            />
          )}

          {forecastPoints.length > 0 && (
            <ReferenceDot
              x={rows[realDataLength - 1]?.date}
              y={rows[realDataLength - 1]?.revenue}
              r={0}
              label={{
                value: "hoy",
                position: "insideTopRight",
                fill: COLORS.axis,
                fontSize: 10,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
