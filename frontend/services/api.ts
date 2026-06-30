import { supabase } from '../lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

function buildUrl(path: string) {
  if (!path.startsWith('http')) {
    if (path.startsWith('/api/v1')) path = path.replace('/api/v1', '');
    return `${API_BASE_URL}${path}`;
  }
  return path;
}

async function defaultHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    if (typeof window !== 'undefined') {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // SSR — no token
  }
  return headers;
}

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
  // Unwrap TransformInterceptor envelope: { data: ..., timestamp: ... }
  return parsed?.data !== undefined ? parsed.data : parsed;
}

export async function apiGet(path: string) {
  const url = buildUrl(path);
  const res = await fetch(url, { cache: 'no-store', headers: await defaultHeaders() });
  return handleRes(res);
}

export async function apiPost(path: string, body: any) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: await defaultHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function apiPatch(path: string, body: any) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: await defaultHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res);
}

export async function apiDelete(path: string) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'DELETE',
    headers: await defaultHeaders(),
  });
  return handleRes(res);
}
