import { supabase } from '../lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

function buildUrl(path: string) {
  if (!path.startsWith('http')) {
    if (path.startsWith('/api/v1')) path = path.replace('/api/v1', '');
    return `${API_BASE_URL}${path}`;
  }
  return path;
}

// ── Token cache ───────────────────────────────────────────────────────────────
// supabase.auth.getSession() is async even when the session is in memory.
// Cache the token for 60 s to avoid the overhead on every request.
let _tokenCache: { token: string; expiresAt: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) return _tokenCache.token;
  if (typeof window === 'undefined') return null;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      _tokenCache = { token, expiresAt: Date.now() + 60_000 };
      return token;
    }
    const localToken = localStorage.getItem('ipms_local_token');
    if (localToken) {
      _tokenCache = { token: localToken, expiresAt: Date.now() + 60_000 };
      return localToken;
    }
  } catch { /* SSR or no session */ }
  return null;
}

export function invalidateTokenCache() {
  _tokenCache = null;
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = await getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// ── Response handling ─────────────────────────────────────────────────────────
async function handleRes(res: Response) {
  const text = await res.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!res.ok) {
    const err = new Error(parsed?.message || `API error ${res.status}`);
    (err as any).status = res.status;
    (err as any).data = parsed;
    throw err;
  }
  return parsed?.data !== undefined ? parsed.data : parsed;
}

// ── In-flight deduplication for GET requests ──────────────────────────────────
// Concurrent calls to the same URL (e.g. /auth/me from multiple components)
// share a single in-flight request instead of each firing their own.
const _inFlight = new Map<string, Promise<any>>();

export async function apiGet(path: string): Promise<any> {
  const url = buildUrl(path);
  const existing = _inFlight.get(url);
  if (existing) return existing;

  const promise = authHeaders()
    .then(headers => fetch(url, { headers }))
    .then(handleRes)
    .finally(() => _inFlight.delete(url));

  _inFlight.set(url, promise);
  return promise;
}

export async function apiPost(path: string, body: any) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function apiPatch(path: string, body: any) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function apiUpload(path: string, formData: FormData) {
  const url = buildUrl(path);
  const token = await getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { method: 'POST', headers, body: formData });
  return handleRes(res);
}

export async function apiDelete(path: string) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return handleRes(res);
}
