import { getAccessToken } from "../auth/azureAuth.js";

const DEFAULT_API_URL =
  "https://ca-afkbot-prod.wittyhill-c84871ea.eastus2.azurecontainerapps.io";

function getBaseUrl(): string {
  return process.env.AFKBOT_API_URL || DEFAULT_API_URL;
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export interface PtoRequestInput {
  employee_email: string;
  request_type: "full_day" | "partial_day";
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  details?: string;
  slack_user_id?: string;
  slack_username?: string;
  manager_id?: string;
  manager_email?: string;
}

export interface PtoRequest {
  id: string;
  employee_email: string;
  slack_username?: string;
  request_type: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  details?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  [key: string]: unknown;
}

export async function createPtoRequest(
  input: PtoRequestInput
): Promise<PtoRequest> {
  const res = await fetch(`${getBaseUrl()}/api/pto-requests`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create PTO request (${res.status}): ${body}`);
  }
  return res.json() as Promise<PtoRequest>;
}

export async function listPtoRequests(params?: {
  status?: string;
  limit?: number;
  offset?: number;
  employee_email?: string;
  start_date?: string;
  end_date?: string;
}): Promise<{ requests: PtoRequest[]; total?: number }> {
  const url = new URL(`${getBaseUrl()}/api/pto-requests`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to list PTO requests (${res.status}): ${body}`);
  }
  return res.json() as Promise<{ requests: PtoRequest[]; total?: number }>;
}

export async function getPtoRequest(id: string): Promise<PtoRequest> {
  const res = await fetch(`${getBaseUrl()}/api/pto-requests/${id}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to get PTO request (${res.status}): ${body}`);
  }
  return res.json() as Promise<PtoRequest>;
}

export async function deletePtoRequest(
  id: string,
  reason?: string
): Promise<{ success: boolean; message?: string }> {
  const url = new URL(`${getBaseUrl()}/api/pto-requests/${id}`);
  if (reason) url.searchParams.set("reason", reason);
  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to cancel PTO request (${res.status}): ${body}`);
  }
  return res.json() as Promise<{ success: boolean; message?: string }>;
}

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${getBaseUrl()}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed (${res.status})`);
  }
  return res.json() as Promise<{ status: string }>;
}
