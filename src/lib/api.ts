import type { Dashboard, User } from '../types';
import { getApiBaseUrl, shouldUseDemoMode } from './apiConfig';

// ─── Demo mode detection ──────────────────────────────────────
const SESSION_KEY = 'bb-dash:session';
const LAST_LOGIN_KEY = 'bb-dash:lastlogin';

function isDemo(): boolean {
  if (typeof window === 'undefined') return false;
  return shouldUseDemoMode({
    dev: import.meta.env.DEV,
    urlSearch: window.location.search,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
  });
}

export function getDemoMode(): boolean { return isDemo(); }

function getCurrentApiBaseUrl(): string {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return getApiBaseUrl({
    configuredApiBaseUrl: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3001' : undefined),
    origin,
  });
}

// ─── Session storage ──────────────────────────────────────────
export interface Session {
  sessionId: string;
  userId: string;
  xsrf: string;
  school: string;
  username?: string;
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch { return null; }
}

export function setSession(s: Session | null) {
  if (typeof window === 'undefined') return;
  if (s === null) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function getLastLogin(): { school: string; username: string } {
  if (typeof window === 'undefined') return { school: 'cetys', username: '' };
  try {
    const raw = window.localStorage.getItem(LAST_LOGIN_KEY);
    return raw ? JSON.parse(raw) : { school: 'cetys', username: '' };
  } catch { return { school: 'cetys', username: '' }; }
}

export function setLastLogin(school: string, username: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_LOGIN_KEY, JSON.stringify({ school, username }));
}

// ─── API layer ────────────────────────────────────────────────
interface ApiEnvelope {
  ok?: boolean;
  error?: string;
}

function mergeHeaders(base: Record<string, string>, next?: HeadersInit): Headers {
  const merged = new Headers(base);
  if (!next) return merged;
  new Headers(next).forEach((value, key) => {
    merged.set(key, value);
  });
  return merged;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  if (isDemo()) {
    await new Promise(r => setTimeout(r, 250));
    return (await mockApi(path)) as T;
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const session = getSession();
  if (session?.sessionId) headers['X-BB-Session'] = session.sessionId;
  const r = await fetch(getCurrentApiBaseUrl() + path, { ...opts, headers: mergeHeaders(headers, opts.headers) });
  const contentType = r.headers.get('content-type') || '';
  const j = (contentType.includes('application/json') ? await r.json() : { ok: false, error: await r.text() }) as ApiEnvelope;
  if (!r.ok || j.ok === false) throw new Error(j.error || 'HTTP ' + r.status);
  return j as T;
}

async function mockApi(path: string): Promise<unknown> {
  if (!import.meta.env.DEV) throw new Error('Demo mode is disabled in production');
  const { DEMO_DASHBOARD } = await import('./demoData');

  if (path === '/api/login') {
    return { ok: true, sessionId: 'demo-sid-' + Date.now(), userId: '_demo_user_1', xsrf: 'demo-xsrf', school: 'cetys.blackboard.com' };
  }
  if (path === '/api/me') return { ok: true, user: DEMO_DASHBOARD.user };
  if (path === '/api/memberships') {
    return { ok: true, currentTerm: '2026-S1', memberships: DEMO_DASHBOARD.materias.map(m => ({ courseId: m.courseId, displayName: m.displayName, ultraStatus: m.ultraStatus, term: m.term, lastAccess: m.lastAccess, isCurrent: true })) };
  }
  if (path === '/api/dashboard') return DEMO_DASHBOARD;
  if (path === '/api/logout') return { ok: true };
  return { ok: false, error: 'mock 404: ' + path };
}

export const api = {
  async login(school: string, username: string, password: string) {
    const r = await request<{ ok: boolean; sessionId: string; userId: string; xsrf: string; school: string }>('/api/login', {
      method: 'POST', body: JSON.stringify({ school, username, password }),
    });
    if (r.ok) {
      setSession({ sessionId: r.sessionId, userId: r.userId, xsrf: r.xsrf, school: r.school, username });
    }
    return r;
  },
  async logout() {
    try {
      await request<{ ok: boolean }>('/api/logout', { method: 'POST' });
    } catch {
      // Local logout should clear client state even if the backend session is already gone.
    }
    setSession(null);
  },
  me: () => request<{ ok: boolean; user: User }>('/api/me'),
  dashboard: () => request<Dashboard>('/api/dashboard'),
};
