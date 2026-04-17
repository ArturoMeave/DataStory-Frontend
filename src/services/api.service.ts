export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("datastory_token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error ?? `Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function generateSummary(dataSummary: string): Promise<string> {
  const data = await request<{ content: string }>("/api/ai/generate", {
    method: "POST",
    body: JSON.stringify({
      prompt: dataSummary,
      systemPrompt:
        "Eres un analista financiero conciso. Recibes un resumen de datos financieros y respondes con un análisis claro de 2-3 párrafos. No uses listas con guiones. No uses markdown. Escribe en español en prosa directa. Destaca lo más importante: metas, tendencias y riesgos.",
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
      systemPrompt:
        'Eres un consultor de negocio. A partir de los datos devuelve SOLO un JSON válido. Formato: [{"text": "acción", "priority": "high|medium|low"}]. Genera 3 tareas.',
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
      prompt: `${historyText ? `Historial:\n${historyText}\n\n` : ""}Pregunta: ${question}`,
      systemPrompt: `Eres un asistente financiero. Contexto: ${dataSummary}. Responde en español, de forma concisa y directa.`,
      maxTokens: 400,
    }),
  });
  return data.content;
}

export async function saveSnapshot(
  snapshotData: any,
): Promise<{ ok: boolean; id: string }> {
  return request("/api/snapshots", {
    method: "POST",
    body: JSON.stringify(snapshotData),
  });
}

export async function registerUser(
  email: string,
  password: string,
  name?: string,
  inviteCode?: string | null,
): Promise<any> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name, inviteCode }),
  });
}

export async function loginUser(email: string, password: string): Promise<any> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function verify2FALogin(
  userId: string,
  token: string,
): Promise<any> {
  return request("/api/auth/login/verify-2fa", {
    method: "POST",
    body: JSON.stringify({ userId, token }),
  });
}

export async function generate2FA(): Promise<{
  secret: string;
  qrCodeDataUrl: string;
}> {
  return request("/api/auth/2fa/generate", { method: "POST" });
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

export async function getSessions(): Promise<any[]> {
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

export async function deleteAccount(
  password: string,
): Promise<{ ok: boolean }> {
  return request("/api/auth/delete-account", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

export async function getSnapshots(): Promise<any[]> {
  return request("/api/snapshots/me");
}

export async function getSharedSnapshot(id: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/api/snapshots/share/${id}`);
  if (!response.ok) throw new Error("Dashboard not found");
  return response.json();
}

// ==========================================
// LAS 6 FUNCIONES QUE HABÍAMOS BORRADO
// ==========================================

export async function revokeAllSessions(): Promise<{ ok: boolean }> {
  return request("/api/sessions", { method: "DELETE" });
}

export async function getWorkspaceMembers(): Promise<any> {
  return request("/api/workspaces/members");
}

export async function updateMemberRole(
  userId: string,
  role: string,
): Promise<any> {
  return request(`/api/workspaces/members/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export async function generateInvitation(role: string): Promise<any> {
  return request("/api/invitations/generate", {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

export async function validateInvitation(code: string): Promise<any> {
  return request(`/api/invitations/validate/${code}`);
}

export async function acceptInvitation(code: string, force: boolean = false): Promise<any> {
  return request("/api/invitations/accept", {
    method: "POST",
    body: JSON.stringify({ code, force }),
  });
}

export async function getWorkspaceInvitations(): Promise<any[]> {
  return request("/api/invitations");
}

export async function revokeInvitation(id: string): Promise<any> {
  return request(`/api/invitations/${id}`, {
    method: "DELETE",
  });
}
