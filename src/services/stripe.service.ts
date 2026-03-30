import type { DataRow } from "../types";

const STRIPE_API = "https://api.stripe.com/v1";

interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  created: number;
  status: string;
}

interface StripeListResponse<T> {
  data: T[];
  has_more: boolean;
}

function timestampToDate(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

function groupByDay(charges: StripeCharge[]): DataRow[] {
  const byDay: Record<string, number> = {};

  for (const charge of charges) {
    if (charge.status !== "succeeded") continue;
    const date = timestampToDate(charge.created);
    byDay[date] = (byDay[date] ?? 0) + charge.amount / 100;
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date,
      revenue,
      expenses: 0,
      label: "Stripe",
    }));
}

export async function fetchStripeData(apiKey: string): Promise<DataRow[]> {
  if (!apiKey.startsWith("sk_")) {
    throw new Error(
      'La clave debe empezar por "sk_". Las claves públicas (pk_) no tienen acceso a los cobros.',
    );
  }

  const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
  const params = new URLSearchParams({
    limit: "100",
    "created[gte]": String(ninetyDaysAgo),
  });

  const response = await fetch(`${STRIPE_API}/charges?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error?.error?.message ?? `Error de Stripe: ${response.status}`,
    );
  }

  const data: StripeListResponse<StripeCharge> = await response.json();

  if (data.data.length === 0) {
    throw new Error("No se encontraron cobros en los últimos 90 días.");
  }

  return groupByDay(data.data);
}
