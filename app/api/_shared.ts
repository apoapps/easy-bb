const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

export function getBackendBaseUrl(env: NodeJS.ProcessEnv = process.env): string | null {
  const configured = env.BACKEND_API_BASE_URL || env.NEXT_PUBLIC_API_BASE_URL || env.VITE_API_BASE_URL;
  const normalized = configured?.trim().replace(/\/+$/, '');
  return normalized || null;
}

function jsonError(status: number, code: string, error: string): Response {
  return Response.json({ ok: false, code, error }, { status });
}

function proxyHeaders(headers: Headers): Headers {
  const next = new Headers();
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) next.set(key, value);
  });
  return next;
}

export async function proxyOrExplainMissingBackend(
  request: Request,
  path: string,
  allowedMethods: string[],
): Promise<Response> {
  if (!allowedMethods.includes(request.method)) {
    return jsonError(405, 'METHOD_NOT_ALLOWED', 'Metodo no permitido para esta ruta.');
  }

  const baseUrl = getBackendBaseUrl();
  if (!baseUrl) {
    return jsonError(
      501,
      'BACKEND_NOT_CONFIGURED',
      'Backend de produccion no configurado. Configura BACKEND_API_BASE_URL en Vercel para proxyear una API real, o NEXT_PUBLIC_API_BASE_URL para llamar una API externa desde el cliente.',
    );
  }

  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();
  const upstream = await fetch(`${baseUrl}${path}`, {
    method: request.method,
    headers: proxyHeaders(request.headers),
    body,
    cache: 'no-store',
  });

  const headers = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}
