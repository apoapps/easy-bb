import type { Dashboard, User } from '../../src/types';

export interface LoginBody {
  school: string;
  username: string;
  password: string;
}

interface ApiError {
  ok: false;
  code: string;
  error: string;
}

export function jsonError(status: number, code: string, error: string): Response {
  return Response.json({ ok: false, code, error } satisfies ApiError, { status });
}

export async function parseLoginBody(request: Request): Promise<LoginBody> {
  const raw = await request.json().catch(() => null) as Partial<LoginBody> | null;
  const school = typeof raw?.school === 'string' ? raw.school.trim().replace(/^https?:\/\//, '').replace(/\.blackboard\.com\/?$/, '') : '';
  const username = typeof raw?.username === 'string' ? raw.username.trim() : '';
  const password = typeof raw?.password === 'string' ? raw.password : '';

  if (!school || !username || !password) {
    throw new Error('Falta escuela, usuario o contrasena.');
  }

  return { school, username, password };
}

export function getSessionId(request: Request): string | null {
  const sessionId = request.headers.get('x-bb-session')?.trim();
  return sessionId || null;
}

export function missingSession(): Response {
  return jsonError(401, 'SESSION_REQUIRED', 'Inicia sesion para consultar datos de Blackboard.');
}

export type LoginResponse = {
  ok: true;
  sessionId: string;
  userId: string;
  xsrf: string;
  school: string;
};

export type MeResponse = {
  ok: true;
  user: User;
};

export type DashboardResponse = Dashboard;
