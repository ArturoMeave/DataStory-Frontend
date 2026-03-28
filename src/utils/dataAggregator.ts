import type { DataRow } from "../types";

export function totalRevenue(rows: DataRow[]): number {
  return rows.reduce((sum, row) => sum + row.revenue, 0);
}

export function totalExpenses(rows: DataRow[]): number {
  return rows.reduce((sum, row) => sum + row.expenses, 0);
}

export function netProfit(rows: DataRow[]): number {
  return totalRevenue(rows) - totalExpenses(rows);
}

export function profitMargin(rows: DataRow[]): number {
  const rev = totalRevenue(rows);
  if (rev === 0) return 0;
  return (netProfit(rows) / rev) * 100;
}

export function goalProgress(rows: DataRow[], goalAmount: number): number {
  if (goalAmount === 0) return 0;
  return (totalRevenue(rows) / goalAmount) * 100;
}

export function formatCurrency(value: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

// Construye el resumen de texto que enviamos a la IA.
// No enviamos el CSV completo porque puede tener miles de filas
// y agotaría el contexto del modelo. Solo enviamos los números clave.
export function buildDataSummary(rows: DataRow[], goalAmount?: number): string {
  const rev = totalRevenue(rows);
  const exp = totalExpenses(rows);
  const profit = netProfit(rows);
  const margin = profitMargin(rows);

  let summary = `Resumen financiero de ${rows.length} períodos:
- Ingresos totales: ${formatCurrency(rev)}
- Gastos totales: ${formatCurrency(exp)}
- Beneficio neto: ${formatCurrency(profit)}
- Margen de beneficio: ${margin.toFixed(1)}%`;

  if (goalAmount) {
    const progress = goalProgress(rows, goalAmount);
    summary += `\n- Meta de facturación: ${formatCurrency(goalAmount)} (progreso: ${progress.toFixed(1)}%)`;
  }

  const recent = rows.slice(-3);
  if (recent.length > 0) {
    summary += "\n\nÚltimos períodos:";
    recent.forEach((row) => {
      summary += `\n- ${row.date}: ingresos ${formatCurrency(row.revenue)}, gastos ${formatCurrency(row.expenses)}`;
    });
  }

  return summary;
}
