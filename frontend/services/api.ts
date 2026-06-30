const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333';

function buildUrl(path: string) {
  // Support frontend using '/api/v1/...' while backend routes are mounted at '/'
  if (!path.startsWith('http')) {
    // strip leading /api/v1 prefix if present
    if (path.startsWith('/api/v1')) path = path.replace('/api/v1', '');
    return `${API_BASE_URL}${path}`;
  }
  return path;
}

function defaultHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ipms_token') : null;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch (e) {
    // ignore (SSR)
  }
  return headers;
}

async function handleRes(res: Response) {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
  if (!res.ok) {
    const err = new Error(data?.message || `API error ${res.status}`);
    (err as any).status = res.status;
    (err as any).data = data;
    throw err;
  }
  return data;
}

export async function apiGet(path: string) {
  const url = buildUrl(path);
  const res = await fetch(url, { cache: 'no-store', headers: defaultHeaders() });
  return handleRes(res as Response);
}

export async function apiPost(path: string, body: any) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res as Response);
}

export async function apiPatch(path: string, body: any) {
  const url = buildUrl(path);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: defaultHeaders(),
    body: JSON.stringify(body),
  });
  return handleRes(res as Response);
}
