// lib/apiClient.ts
import { getToken } from "./auth";

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const token = getToken();

  const baseHeaders = {
    ...(init?.headers || {}),
  } as Record<string, string>;

  // Only attach Authorization header if we actually have a token
  const headers = token
    ? { ...baseHeaders, Authorization: `Bearer ${token}` }
    : baseHeaders;

  return fetch(input, {
    ...init,
    headers,
    credentials: "include", // ✅ if your backend also sets cookies
  });
}
