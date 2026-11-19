/**
 * Safely parse a fetch Response as JSON.
 * Protects against:
 * 1. "Failed to execute 'json' on 'Response': Unexpected end of JSON input" (empty bodies)
 * 2. "Unexpected token '<', '<!DOCTYPE '... is not valid JSON" (HTML error pages)
 * 3. Network proxy or Caddy 403/502/504 errors
 */
export async function safeJson<T = any>(res: Response): Promise<{
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}> {
  const status = res.status;
  const ok = res.ok;
  let text = "";

  try {
    text = await res.text();
  } catch (err: any) {
    return {
      ok: false,
      status,
      data: {} as T,
      error: err?.message || "Failed to read network response.",
    };
  }

  const trimmed = text ? text.trim() : "";
  if (!trimmed) {
    return {
      ok,
      status,
      data: {} as T,
      error: ok ? undefined : `Server returned empty response (HTTP ${status}).`,
    };
  }

  try {
    const data = JSON.parse(trimmed);
    return {
      ok,
      status,
      data,
      error: ok ? undefined : (data.error || data.message || `Request failed with status ${status}.`),
    };
  } catch {
    return {
      ok: false,
      status,
      data: {} as T,
      error: `Server response error (${status}). Please check network connectivity.`,
    };
  }
}
