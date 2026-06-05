import { BlackboardError, fetchCurrentUserFromSession } from '../_blackboard';
import { jsonError, missingSession, type MeResponse } from '../_backend';
import { getSessionFromRequest } from '../_session';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return missingSession();
  try {
    return Response.json({ ok: true, user: await fetchCurrentUserFromSession(session) } satisfies MeResponse);
  } catch (error) {
    if (error instanceof BlackboardError) return jsonError(error.status, error.code, error.message);
    return jsonError(502, 'BLACKBOARD_UNAVAILABLE', 'No se pudo leer el perfil desde Blackboard.');
  }
}
