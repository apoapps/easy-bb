import { BlackboardError, fetchMembershipsFromSession } from '../_blackboard';
import { jsonError, missingSession } from '../_backend';
import { getSessionFromRequest } from '../_session';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return missingSession();
  try {
    return Response.json(await fetchMembershipsFromSession(session));
  } catch (error) {
    if (error instanceof BlackboardError) return jsonError(error.status, error.code, error.message);
    return jsonError(502, 'BLACKBOARD_UNAVAILABLE', 'Could not read courses from Blackboard.');
  }
}
