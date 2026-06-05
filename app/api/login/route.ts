import { BlackboardError, loginToBlackboard } from '../_blackboard';
import { jsonError, parseLoginBody, type LoginResponse } from '../_backend';
import { createSessionCookie, sealSession } from '../_session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body;
  try {
    body = await parseLoginBody(request);
  } catch (error) {
    return jsonError(400, 'INVALID_LOGIN_INPUT', error instanceof Error ? error.message : 'Invalid sign-in data.');
  }

  try {
    const { session } = await loginToBlackboard(body);
    const sealed = sealSession(session);
    return Response.json({
      ok: true,
      sessionId: 'next-cookie',
      userId: session.userId,
      xsrf: '',
      school: session.school,
    } satisfies LoginResponse, {
      headers: { 'Set-Cookie': createSessionCookie(sealed) },
    });
  } catch (error) {
    if (error instanceof BlackboardError) return jsonError(error.status, error.code, error.message);
    return jsonError(502, 'BLACKBOARD_UNAVAILABLE', 'Could not connect to Blackboard.');
  }
}
