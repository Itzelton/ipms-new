export const runtime = 'edge';
export const revalidate = 0;

export async function GET() {
  try {
    await fetch('https://ipms-newback.onrender.com/health', { signal: AbortSignal.timeout(8000) });
  } catch { /* ignore — just keeping Render awake */ }
  return new Response('ok');
}
