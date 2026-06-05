import type { Actividad, Dashboard, GradeStatus, Materia, User } from '../../src/types';
import type { LoginBody } from './_backend';
import { buildSession, type BlackboardSession } from './_session';

type JsonRecord = Record<string, unknown>;

interface BlackboardContext {
  origin: string;
  jar: CookieJar;
}

interface BlackboardLoginResult {
  session: BlackboardSession;
  user: User;
}

interface MembershipCourse {
  courseId: string;
  displayName: string;
  ultraStatus: 'ULTRA' | 'CLASSIC';
  term: { name: string; startDate?: string; endDate?: string; id?: string };
  lastAccess: string | null;
  isCurrent: boolean;
}

export class BlackboardError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'BlackboardError';
    this.status = status;
    this.code = code;
  }
}

export class CookieJar {
  private cookies = new Map<string, string>();

  static fromCookieHeader(header: string): CookieJar {
    const jar = new CookieJar();
    header.split(';').forEach(pair => {
      const [name, ...valueParts] = pair.trim().split('=');
      if (name && valueParts.length > 0) jar.cookies.set(name, valueParts.join('='));
    });
    return jar;
  }

  addFromHeaders(headers: Headers): void {
    getSetCookieHeaders(headers).forEach(cookie => this.add(cookie));
  }

  add(setCookie: string): void {
    const [pair] = setCookie.split(';');
    const eq = pair.indexOf('=');
    if (eq <= 0) return;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!name) return;
    if (!value) this.cookies.delete(name);
    else this.cookies.set(name, value);
  }

  header(): string {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
  }
}

type HeadersWithSetCookie = Headers & { getSetCookie?: () => string[] };

function getSetCookieHeaders(headers: Headers): string[] {
  const getSetCookie = (headers as HeadersWithSetCookie).getSetCookie;
  if (typeof getSetCookie === 'function') return getSetCookie.call(headers);
  const raw = headers.get('set-cookie');
  if (!raw) return [];
  return raw.split(/,(?=\s*[^;,]+=)/).map(value => value.trim()).filter(Boolean);
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function resultsArray(value: unknown): JsonRecord[] {
  const record = asRecord(value);
  const results = Array.isArray(record?.results) ? record.results : [];
  return results.flatMap(item => {
    const itemRecord = asRecord(item);
    return itemRecord ? [itemRecord] : [];
  });
}

export function normalizeSchool(input: string): { school: string; origin: string } {
  const school = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.blackboard\.com$/, '');
  if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)*$/.test(school)) {
    throw new BlackboardError(400, 'INVALID_SCHOOL', 'The school subdomain is not valid.');
  }
  return { school, origin: `https://${school}.blackboard.com` };
}

export function parseHiddenInputs(html: string): Record<string, string> {
  const inputs: Record<string, string> = {};
  const inputPattern = /<input\b[^>]*>/gi;
  for (const [tag] of html.matchAll(inputPattern)) {
    const name = attr(tag, 'name');
    if (!name) continue;
    inputs[name] = attr(tag, 'value') || '';
  }
  return inputs;
}

function attr(tag: string, name: string): string | null {
  const pattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = tag.match(pattern);
  return match?.[2] ?? match?.[3] ?? match?.[4] ?? null;
}

async function blackboardFetch(ctx: BlackboardContext, path: string, init: RequestInit = {}, redirectCount = 0): Promise<Response> {
  const headers = new Headers(init.headers);
  const cookieHeader = ctx.jar.header();
  headers.set('User-Agent', 'BB-DASH/1.0');
  headers.set('Accept', headers.get('Accept') || 'text/html,application/json;q=0.9,*/*;q=0.8');
  if (cookieHeader) headers.set('Cookie', cookieHeader);

  const url = path.startsWith('http') ? path : `${ctx.origin}${path}`;
  const response = await fetch(url, {
    ...init,
    headers,
    redirect: 'manual',
    cache: 'no-store',
  });
  ctx.jar.addFromHeaders(response.headers);

  if ([301, 302, 303, 307, 308].includes(response.status) && redirectCount < 8) {
    const location = response.headers.get('location');
    if (!location) return response;
    const nextUrl = new URL(location, url).toString();
    const nextInit: RequestInit = response.status === 307 || response.status === 308
      ? init
      : { method: 'GET', headers: { Accept: headers.get('Accept') || '*/*' } };
    return blackboardFetch(ctx, nextUrl, nextInit, redirectCount + 1);
  }

  return response;
}

async function getJson(ctx: BlackboardContext, path: string): Promise<unknown> {
  const response = await blackboardFetch(ctx, path, { headers: { Accept: 'application/json' } });
  const text = await response.text();
  if (!response.ok) {
    throw new BlackboardError(response.status, 'BLACKBOARD_API_ERROR', blackboardApiError(text, response.status));
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new BlackboardError(502, 'BLACKBOARD_BAD_JSON', 'Blackboard returned an unexpected response format.');
  }
}

function blackboardApiError(body: string, status: number): string {
  try {
    const parsed = asRecord(JSON.parse(body) as unknown);
    const message = stringValue(parsed?.message) || stringValue(parsed?.error_description) || stringValue(parsed?.error);
    if (message) return message;
  } catch {
    // Keep the generic message below.
  }
  if (status === 401 || status === 403) return 'Blackboard did not authorize the request. Check the username, password, or account permissions.';
  return `Blackboard returned HTTP ${status}.`;
}

export async function loginToBlackboard(body: LoginBody): Promise<BlackboardLoginResult> {
  const { school, origin } = normalizeSchool(body.school);
  const ctx: BlackboardContext = { origin, jar: new CookieJar() };
  const loginPage = await blackboardFetch(ctx, '/webapps/login/?action=login');
  const loginHtml = await loginPage.text();
  const hidden = parseHiddenInputs(loginHtml);
  const form = new URLSearchParams({
    ...hidden,
    user_id: body.username,
    password: body.password,
    action: hidden.action || 'login',
    login: 'Sign in',
  });

  const loginResponse = await blackboardFetch(ctx, '/webapps/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: origin,
      Referer: `${origin}/webapps/login/?action=login`,
    },
    body: form,
  });
  const loginText = await loginResponse.clone().text().catch(() => '');
  if (looksLikeMfa(loginText)) {
    throw new BlackboardError(403, 'MFA_REQUIRED', 'Blackboard requested additional verification. Complete MFA in Blackboard and try again.');
  }

  const user = await fetchCurrentUser(ctx).catch(error => {
    if (error instanceof BlackboardError && (error.status === 401 || error.status === 403)) {
      throw new BlackboardError(401, 'BLACKBOARD_LOGIN_FAILED', 'Blackboard sign in failed with those credentials.');
    }
    throw error;
  });

  return {
    user,
    session: buildSession({
      school,
      origin,
      userId: user.id,
      cookieHeader: ctx.jar.header(),
    }),
  };
}

function looksLikeMfa(html: string): boolean {
  const hidden = parseHiddenInputs(html);
  return hidden.showMFAVerification === 'true' || hidden.showMFARegistration === 'true';
}

function contextFromSession(session: BlackboardSession): BlackboardContext {
  return {
    origin: session.origin,
    jar: CookieJar.fromCookieHeader(session.cookieHeader),
  };
}

export async function fetchCurrentUserFromSession(session: BlackboardSession): Promise<User> {
  return fetchCurrentUser(contextFromSession(session));
}

async function fetchCurrentUser(ctx: BlackboardContext): Promise<User> {
  const raw = asRecord(await getJson(ctx, '/learn/api/public/v1/users/me'));
  if (!raw) throw new BlackboardError(502, 'BLACKBOARD_BAD_USER', 'Blackboard did not return a user profile.');
  return normalizeUser(raw);
}

function normalizeUser(raw: JsonRecord): User {
  const name = [
    stringValue(raw.givenName),
    stringValue(raw.familyName),
  ].filter(Boolean).join(' ');
  const id = stringValue(raw.id) || stringValue(raw.uuid) || stringValue(raw.userName);
  if (!id) throw new BlackboardError(502, 'BLACKBOARD_BAD_USER', 'The Blackboard profile does not include a user ID.');
  return {
    id,
    name: stringValue(raw.name) || name || stringValue(raw.userName) || id,
    givenName: stringValue(raw.givenName),
    familyName: stringValue(raw.familyName),
    email: stringValue(raw.email),
    studentId: stringValue(raw.studentId),
    batchUid: stringValue(raw.externalId) || stringValue(raw.batchUid),
    userName: stringValue(raw.userName),
    avatar: stringValue(raw.avatar),
  };
}

export async function fetchMembershipsFromSession(session: BlackboardSession): Promise<{ ok: true; currentTerm: string; memberships: MembershipCourse[] }> {
  const memberships = await fetchMemberships(contextFromSession(session), session.userId);
  return {
    ok: true,
    currentTerm: memberships[0]?.term.name || 'Actual',
    memberships,
  };
}

async function fetchMemberships(ctx: BlackboardContext, userId: string): Promise<MembershipCourse[]> {
  const data = await getJson(ctx, `/learn/api/public/v1/users/${encodeURIComponent(userId)}/courses?expand=course,course.term&limit=100`);
  return resultsArray(data).flatMap(item => {
    const course = asRecord(item.course) || item;
    const id = stringValue(course.id) || stringValue(item.courseId);
    if (!id) return [];
    const term = asRecord(course.term);
    return [{
      courseId: id,
      displayName: stringValue(course.name) || stringValue(course.displayName) || stringValue(course.courseId) || id,
      ultraStatus: /ultra/i.test(stringValue(course.ultraStatus) || '') ? 'ULTRA' : 'CLASSIC',
      term: {
        name: stringValue(term?.name) || stringValue(course.termId) || 'Actual',
        id: stringValue(term?.id) || stringValue(course.termId),
        startDate: stringValue(term?.startDate),
        endDate: stringValue(term?.endDate),
      },
      lastAccess: stringValue(item.lastAccessed) || stringValue(item.lastAccess) || null,
      isCurrent: stringValue(asRecord(item.availability)?.available) !== 'No',
    }];
  });
}

export async function fetchDashboardFromSession(session: BlackboardSession): Promise<Dashboard> {
  const ctx = contextFromSession(session);
  const [user, courses] = await Promise.all([
    fetchCurrentUser(ctx),
    fetchMemberships(ctx, session.userId),
  ]);
  const materias = await Promise.all(courses.map(course => fetchMateria(ctx, course, session.userId)));
  const actividades = materias.flatMap(materia => materia.actividades);
  const urgentes = actividades.filter(activity => activity.status === 'OVERDUE').slice(0, 12);
  const pendientes = actividades.filter(activity => activity.score === null && activity.status !== 'OVERDUE').slice(0, 12);
  const graded = actividades.filter(activity => activity.pct !== null);
  const promedioGeneral = graded.length
    ? Math.round(graded.reduce((sum, activity) => sum + (activity.pct || 0), 0) / graded.length)
    : null;

  return {
    ok: true,
    user,
    materias,
    urgentes,
    pendientes,
    kpis: {
      promedioGeneral,
      materiasActivas: materias.length,
      actividadesTotales: actividades.length,
      actividadesCalificadas: graded.length,
      pendientesCalificar: pendientes.length,
      urgentes: urgentes.length,
      promedioColor: promedioColor(promedioGeneral),
    },
  };
}

async function fetchMateria(ctx: BlackboardContext, course: MembershipCourse, userId: string): Promise<Materia> {
  const actividades = await fetchActivities(ctx, course, userId).catch(() => []);
  const graded = actividades.filter(activity => activity.score !== null && activity.pointsPossible > 0);
  const totalEarned = round(graded.reduce((sum, activity) => sum + (activity.score || 0), 0));
  const totalPossible = round(graded.reduce((sum, activity) => sum + activity.pointsPossible, 0));
  const promedio = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : null;
  return {
    ...course,
    promedio,
    totalEarned,
    totalPossible,
    actividades,
    urgentes: actividades.filter(activity => activity.status === 'OVERDUE'),
    pendientes: actividades.filter(activity => activity.score === null && activity.status !== 'OVERDUE'),
  };
}

async function fetchActivities(ctx: BlackboardContext, course: MembershipCourse, userId: string): Promise<Actividad[]> {
  const columns = resultsArray(await getJson(ctx, `/learn/api/public/v2/courses/${encodeURIComponent(course.courseId)}/gradebook/columns?limit=100`));
  const visibleColumns = columns.filter(column => stringValue(asRecord(column.availability)?.available) !== 'No');
  const activities = await Promise.all(visibleColumns.map(column => fetchColumnActivity(ctx, course, userId, column).catch(() => null)));
  return activities.flatMap(activity => activity ? [activity] : []);
}

async function fetchColumnActivity(ctx: BlackboardContext, course: MembershipCourse, userId: string, column: JsonRecord): Promise<Actividad | null> {
  const columnId = stringValue(column.id);
  if (!columnId) return null;
  const grade = await fetchColumnGrade(ctx, course.courseId, columnId, userId);
  return normalizeActivity(course, column, grade || null);
}

async function fetchColumnGrade(ctx: BlackboardContext, courseId: string, columnId: string, userId: string): Promise<JsonRecord | null> {
  const basePath = `/learn/api/public/v2/courses/${encodeURIComponent(courseId)}/gradebook/columns/${encodeURIComponent(columnId)}/users`;
  const singleUser = await getJson(ctx, `${basePath}/${encodeURIComponent(userId)}`).catch(() => null);
  const singleRecord = asRecord(singleUser);
  if (singleRecord) return singleRecord;

  const grades = resultsArray(await getJson(ctx, `${basePath}?limit=200`));
  return grades.find(candidate => stringValue(candidate.userId) === userId) || null;
}

function normalizeActivity(course: MembershipCourse, column: JsonRecord, grade: JsonRecord | null): Actividad | null {
  const columnId = stringValue(column.id);
  if (!columnId) return null;
  const scoreRecord = asRecord(column.score);
  const grading = asRecord(column.grading);
  const displayGrade = asRecord(grade?.displayGrade);
  const possible = numberValue(scoreRecord?.possible) || numberValue(displayGrade?.possible) || numberValue(grade?.pointsPossible) || 0;
  const score = numberValue(grade?.score) ?? numberValue(displayGrade?.score) ?? null;
  const pct = score !== null && possible > 0 ? Math.round((score / possible) * 100) : null;
  const dueDate = stringValue(grading?.due) || stringValue(column.dueDate) || null;
  return {
    columnId,
    columnName: stringValue(column.displayName) || stringValue(column.name) || 'Actividad',
    score,
    pointsPossible: possible,
    status: normalizeStatus(stringValue(grade?.status), score, dueDate),
    dueDate,
    isOverride: Boolean(grade?.overridden),
    lastOverrideDate: stringValue(grade?.overridden) || null,
    text: stringValue(grade?.text) || stringValue(displayGrade?.text) || null,
    pct,
    courseName: course.displayName,
    courseId: course.courseId,
  };
}

function normalizeStatus(status: string | undefined, score: number | null, dueDate: string | null): GradeStatus {
  if (score !== null) return 'GRADED';
  if (dueDate && Date.parse(dueDate) < Date.now()) return 'OVERDUE';
  if (!status) return 'NOT_ATTEMPTED';
  if (/needs/i.test(status)) return 'NEEDS_GRADING';
  if (/progress/i.test(status)) return 'IN_PROGRESS';
  if (/graded/i.test(status)) return 'GRADED';
  return 'NOT_ATTEMPTED';
}

function promedioColor(value: number | null): Dashboard['kpis']['promedioColor'] {
  if (value === null) return 'muted';
  if (value >= 90) return 'good';
  if (value >= 80) return 'ok';
  if (value >= 70) return 'warn';
  return 'bad';
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
