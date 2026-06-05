import { describe, expect, it } from 'vitest';
import { backendNotImplemented, parseLoginBody } from './_backend';

describe('Next backend helpers', () => {
  it('does not ask for an external backend URL', async () => {
    const response = backendNotImplemented('login');
    const body = await response.json();

    expect(response.status).toBe(501);
    expect(body.code).toBe('BLACKBOARD_CONNECTOR_NOT_IMPLEMENTED');
    expect(body.error).not.toMatch(/BACKEND_API_BASE_URL|NEXT_PUBLIC_API_BASE_URL|proxy|proxyear/i);
  });

  it('validates login input on the Next backend', async () => {
    await expect(parseLoginBody(new Request('http://localhost/api/login', {
      method: 'POST',
      body: JSON.stringify({ school: 'cetys', username: 'm000001', password: 'secret' }),
    }))).resolves.toEqual({ school: 'cetys', username: 'm000001', password: 'secret' });
  });
});
