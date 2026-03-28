import Papa from "papaparse";
import type { DataRow } from "../types";

interface RawCSVRow {
  [key: string]: string;
}

// Busca una columna por nombre ignorando mayúsculas y espacios.
// Así "Fecha", "FECHA" y "fecha" se detectan igual.
function findColumn(headers: string[], candidates: string[]): string | null {
  const normalized = headers.map((h) => h.toLowerCase().trim());
  for (const candidate of candidates) {
    const index = normalized.indexOf(candidate.toLowerCase());
    if (index !== -1) return headers[index];
  }
  return null;
}

// Limpia un valor numérico eliminando símbolos de moneda y espacios.
// "1.500,50 €" se convierte en 1500.50
function parseNumber(value: string): number {
  const cleaned = value
    .replace(/[€$£\s]/g, "")
    .replace(/\.(?=\d{3})/g, "")
    .replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export async function parseCSVFile(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(
            new Error(`Error al leer el CSV: ${results.errors[0].message}`),
          );
          return;
        }

        const headers = Object.keys(results.data[0] ?? {});

        // Detectamos las columnas buscando varios nombres posibles
        const dateCol = findColumn(headers, [
          "date",
          "fecha",
          "día",
          "dia",
          "period",
          "periodo",
          "mes",
          "month",
        ]);
        const revenueCol = findColumn(headers, [
          "revenue",
          "ingresos",
          "ventas",
          "sales",
          "income",
          "facturacion",
          "facturación",
        ]);
        const expensesCol = findColumn(headers, [
          "expenses",
          "gastos",
          "costs",
          "costes",
          "expenditure",
          "gasto",
        ]);
        const labelCol = findColumn(headers, [
          "label",
          "etiqueta",
          "category",
          "categoria",
          "categoría",
          "description",
          "descripcion",
        ]);

        if (!dateCol || !revenueCol || !expensesCol) {
          reject(
            new Error(
              `No se encontraron las columnas necesarias.\n` +
                `Tu CSV necesita columnas de fecha, ingresos y gastos.\n` +
                `Columnas detectadas: ${headers.join(", ")}`,
            ),
          );
          return;
        }

        const rows: DataRow[] = results.data.map((row) => ({
          date: row[dateCol]?.trim() ?? "",
          revenue: parseNumber(row[revenueCol] ?? "0"),
          expenses: parseNumber(row[expensesCol] ?? "0"),
          label: labelCol ? row[labelCol]?.trim() : undefined,
        }));

        // Filtramos filas donde tanto ingresos como gastos son 0
        const validRows = rows.filter(
          (r) => r.revenue !== 0 || r.expenses !== 0,
        );

        if (validRows.length === 0) {
          reject(new Error("El CSV no contiene filas con datos válidos."));
          return;
        }

        resolve(validRows);
      },
      error: (error) => {
        reject(new Error(`Error de PapaParse: ${error.message}`));
      },
    });
  });
}
