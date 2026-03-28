import type { DataRow, ForecastPoint } from "../types";

// Calcula la pendiente e intersección de la línea de tendencia.
// Pendiente = cuánto cambia el valor por período.
// Intersección = valor estimado en el período 0.
function linearRegression(values: number[]): {
  slope: number;
  intercept: number;
} {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0 };

  const xMean = (n - 1) / 2;
  const yMean = values.reduce((s, v) => s + v, 0) / n;

  let numerator = 0;
  let denominator = 0;

  values.forEach((y, x) => {
    numerator += (x - xMean) * (y - yMean);
    denominator += Math.pow(x - xMean, 2);
  });

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  return { slope, intercept };
}

// Genera la fecha del siguiente período basándose en el formato de la última fecha.
function generateFutureDate(lastDate: string, offset: number): string {
  // Formato YYYY-MM
  const monthMatch = lastDate.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const year = parseInt(monthMatch[1]);
    const month = parseInt(monthMatch[2]);
    const total = year * 12 + month + offset;
    const newYear = Math.floor((total - 1) / 12);
    const newMonth = ((total - 1) % 12) + 1;
    return `${newYear}-${String(newMonth).padStart(2, "0")}`;
  }

  // Formato YYYY-MM-DD
  const dayMatch = lastDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dayMatch) {
    const d = new Date(lastDate);
    d.setMonth(d.getMonth() + offset);
    return d.toISOString().slice(0, 10);
  }

  // Fallback para otros formatos
  return `${lastDate} +${offset}m`;
}

export function generateForecast(rows: DataRow[]): ForecastPoint[] {
  if (rows.length < 2) return [];

  const revenueRegression = linearRegression(rows.map((r) => r.revenue));
  const expenseRegression = linearRegression(rows.map((r) => r.expenses));

  const n = rows.length;
  const lastDate = rows[n - 1].date;

  return [1, 2, 3].map((offset): ForecastPoint => {
    const forecastIndex = n - 1 + offset;
    const projectedRevenue =
      revenueRegression.intercept + revenueRegression.slope * forecastIndex;
    const projectedExpenses =
      expenseRegression.intercept + expenseRegression.slope * forecastIndex;

    return {
      date: generateFutureDate(lastDate, offset),
      revenue: Math.max(0, Math.round(projectedRevenue)),
      expenses: Math.max(0, Math.round(projectedExpenses)),
      isForecast: true,
    };
  });
}
