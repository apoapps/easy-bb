import { describe, expect, it } from 'vitest';
import { buildSession, createSessionCookie, getSessionFromRequest, sealSession } from './_session';

describe('sealed Next backend session', () => {
  it('roundtrips a Blackboard session through an httpOnly cookie', () => {
    const token = sealSession(buildSession({
      school: 'cetys',
      origin: 'https://cetys.blackboard.com',
      userId: '_1_1',
      cookieHeader: 'JSESSIONID=abc',
    }));
    const cookie = createSessionCookie(token);
    const request = new Request('http://localhost/api/dashboard', {
      headers: { Cookie: cookie.split(';')[0] },
    });

    expect(cookie).toContain('HttpOnly');
    expect(getSessionFromRequest(request)?.cookieHeader).toBe('JSESSIONID=abc');
  });
});
