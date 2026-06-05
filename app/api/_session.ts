import { createHmac, timingSafeEqual } from 'node:crypto';

export interface BlackboardSession {
  school: string;
  origin: string;
  userId: string;
  cookieHeader: string;
  createdAt: number;
  expiresAt: number;
}

const SESSION_COOKIE = 'easy_bb_session';
const SESSION_TTL_SECONDS = 60 * 60 * 6;
const DEV_SESSION_SECRET = 'easy-bb-dev-session-secret-change-in-production';

function getSessionSecret(): string {
  return process.env.BB_SESSION_SECRET || DEV_SESSION_SECRET;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(payload: string): string {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function secureCookieFlag(): string {
  return process.env.NODE_ENV === 'development' ? '' : '; Secure';
}

function isSession(value: unknown): value is BlackboardSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Record<string, unknown>;
  return (
    typeof session.school === 'string' &&
    typeof session.origin === 'string' &&
    session.origin === `https://${session.school}.blackboard.com` &&
    typeof session.userId === 'string' &&
    typeof session.cookieHeader === 'string' &&
    typeof session.createdAt === 'number' &&
    typeof session.expiresAt === 'number'
  );
}

export function sealSession(session: BlackboardSession): string {
  const payload = toBase64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function openSession(token: string): BlackboardSession | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return null;
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(payload)) as unknown;
    if (!isSession(parsed)) return null;
    if (parsed.expiresAt <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secureCookieFlag()}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookieFlag()}`;
}

export function getSessionFromRequest(request: Request): BlackboardSession | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(part => part.trim());
  const pair = cookies.find(cookie => cookie.startsWith(`${SESSION_COOKIE}=`));
  if (!pair) return null;
  return openSession(pair.slice(SESSION_COOKIE.length + 1));
}

export function buildSession(params: Pick<BlackboardSession, 'school' | 'origin' | 'userId' | 'cookieHeader'>): BlackboardSession {
  const createdAt = Date.now();
  return {
    ...params,
    createdAt,
    expiresAt: createdAt + SESSION_TTL_SECONDS * 1000,
  };
}
