import { clearSessionCookie } from '../_session';

export const runtime = 'nodejs';

export function POST() {
  return Response.json({ ok: true }, {
    headers: { 'Set-Cookie': clearSessionCookie() },
  });
}
