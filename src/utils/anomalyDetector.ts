import type { DataRow, AnomalyPoint } from "../types";

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function standardDeviation(values: number[], avg: number): number {
  if (values.length < 2) return 0;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

const THRESHOLD = 2.0;

export function detectAnomalies(rows: DataRow[]): AnomalyPoint[] {
  if (rows.length < 3) return [];

  const anomalies: AnomalyPoint[] = [];

  // Revisamos los gastos
  const expenseValues = rows.map((r) => r.expenses);
  const expMean = mean(expenseValues);
  const expStd = standardDeviation(expenseValues, expMean);

  rows.forEach((row, index) => {
    if (expStd > 0 && Math.abs(row.expenses - expMean) > THRESHOLD * expStd) {
      anomalies.push({
        index,
        date: row.date,
        value: row.expenses,
        type: "expense",
      });
    }
  });

  // Revisamos los ingresos
  const revenueValues = rows.map((r) => r.revenue);
  const revMean = mean(revenueValues);
  const revStd = standardDeviation(revenueValues, revMean);

  rows.forEach((row, index) => {
    if (revStd > 0 && Math.abs(row.revenue - revMean) > THRESHOLD * revStd) {
      const alreadyFlagged = anomalies.some((a) => a.index === index);
      if (!alreadyFlagged) {
        anomalies.push({
          index,
          date: row.date,
          value: row.revenue,
          type: "revenue",
        });
      }
    }
  });

  return anomalies;
}

export function isAnomalyIndex(
  anomalies: AnomalyPoint[],
  index: number,
): boolean {
  return anomalies.some((a) => a.index === index);
}
