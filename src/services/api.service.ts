const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// Función base que hace todas las peticiones HTTP.
// Centraliza el manejo de errores para que no lo repitamos en cada llamada.
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Leemos el token directamente del localStorage
  // para no crear dependencias circulares con el store
  const token = localStorage.getItem("datastory_token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      // Si hay token lo añadimos en la cabecera Authorization
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Error desconocido" }));
    throw new Error(errorData.error ?? `Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

// ── IA ────────────────────────────────────────────────────────────────────────

export async function generateSummary(dataSummary: string): Promise<string> {
  const data = await request<{ content: string }>("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt: dataSummary,
      systemPrompt: `Eres un analista financiero conciso para pequeñas empresas.
Recibes un resumen de datos financieros y respondes con un análisis claro de 2-3 párrafos.
No uses listas con guiones. No uses markdown. Escribe en español en prosa directa.
Destaca lo más importante: si van bien o mal respecto a la meta, la tendencia y el mayor riesgo.`,
      maxTokens: 400,
    }),
  });
  return data.content;
}

export async function generateTasks(dataSummary: string): Promise<string> {
  const data = await request<{ content: string }>("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt: dataSummary,
      systemPrompt: `Eres un consultor de negocio. A partir de los datos financieros devuelves SOLO un JSON válido, sin markdown ni texto extra.
El formato es exactamente: [{"text": "acción concreta", "priority": "high|medium|low"}]
Genera exactamente 3 tareas accionables y específicas basadas en los datos.`,
      maxTokens: 400,
    }),
  });
  return data.content;
}

export async function chatWithData(
  question: string,
  dataSummary: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const historyText = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
    .join("\n");

  const data = await request<{ content: string }>("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt: `${historyText ? `Conversación previa:\n${historyText}\n\n` : ""}Pregunta: ${question}`,
      systemPrompt: `Eres un asistente financiero. Respondes preguntas sobre los datos del usuario.
Contexto de los datos: ${dataSummary}
Responde en español, de forma concisa y directa.`,
      maxTokens: 400,
    }),
  });
  return data.content;
}

// ── Snapshots ─────────────────────────────────────────────────────────────────

export async function saveSnapshot(snapshotData: {
  userId: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  periodCount: number;
  anomalyCount: number;
  goalAmount?: number;
  aiSummary?: string;
  recentPeriods: Array<{ date: string; revenue: number; expenses: number }>;
}): Promise<{ ok: boolean; id: string }> {
  return request("/api/snapshots", {
    method: "POST",
    body: JSON.stringify(snapshotData),
  });
}

export async function registerUser(
  email: string,
  password: string,
  name?: string,
): Promise<{
  token: string;
  user: { id: string; email: string; name: string | null };
}> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{
  token?: string;
  user?: { id: string; email: string; name: string | null };
  requiresTwoFactor?: boolean;
  userId?: string;
}> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getSnapshots(): Promise<any[]> {
  return request("/api/snapshots/me");
}

export async function getSharedSnapshot(id: string): Promise<any> {
  // Petición pública sin token para compartir
  const response = await fetch(`${BASE_URL}/api/snapshots/share/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar el dashboard compartido");
  }

  return response.json();
}

export async function verify2FALogin(
  userId: string,
  token: string,
): Promise<{
  token: string;
  user: { id: string; email: string; name: string | null };
}> {
  return request("/api/auth/login/verify-2fa", {
    method: "POST",
    body: JSON.stringify({ userId, token }),
  });
}

export async function generate2FA(): Promise<{
  secret: string;
  qrCodeDataUrl: string;
}> {
  return request("/api/auth/2fa/generate", {
    method: "POST",
  });
}

export async function enable2FA(
  token: string,
  frequency = "always",
): Promise<{ ok: boolean; message: string }> {
  return request("/api/auth/2fa/enable", {
    method: "POST",
    body: JSON.stringify({ token, frequency }),
  });
}

export async function update2FAFrequency(
  token: string,
  frequency: string,
): Promise<{ ok: boolean; message: string }> {
  return request("/api/auth/2fa/update-frequency", {
    method: "POST",
    body: JSON.stringify({ token, frequency }),
  });
}

export async function getSessions(): Promise<
  Array<{
    id: string;
    device: string;
    browser: string;
    ip: string;
    createdAt: string;
    lastUsed: string;
  }>
> {
  return request("/api/sessions");
}

export async function revokeSession(
  sessionId: string,
  password: string,
): Promise<{ ok: boolean }> {
  return request(`/api/sessions/${sessionId}`, {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

export async function revokeAllSessions(): Promise<{ ok: boolean }> {
  return request("/api/sessions", { method: "DELETE" });
}

export async function deleteAccount(
  password: string,
): Promise<{ ok: boolean }> {
  return request("/api/auth/delete-account", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

// ── EQUIPO ──
export async function getWorkspaceMembers() {
  // Antes: "/workspaces/members" -> Ahora añadimos /api al principio
  return request("/api/workspaces/members");
}

export async function updateMemberRole(userId: string, role: string) {
  // Antes: "/workspaces/members/..." -> Ahora añadimos /api al principio
  return request(`/api/workspaces/members/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

// ── INVITACIONES ──
export async function generateInvitation(role: string) {
  // Es vital que empiece por /api para que el servidor lo reconozca
  return request("/api/invitations/generate", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export async function validateInvitation(code: string) {
  return request(`/api/invitations/validate/${code}`);
}

export async function acceptInvitation(code: string) {
  return request("/api/invitations/accept", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
