import { describe, expect, it } from 'vitest';
import { CookieJar, normalizeSchool, parseHiddenInputs } from './_blackboard';

describe('Blackboard connector helpers', () => {
  it('normalizes Blackboard school subdomains', () => {
    expect(normalizeSchool('https://cetys.blackboard.com/')).toEqual({
      school: 'cetys',
      origin: 'https://cetys.blackboard.com',
    });
  });

  it('parses hidden Blackboard login inputs', () => {
    const html = `
      <input type="hidden" name="action" value="login">
      <input name='blackboard.platform.security.NonceUtil.nonce.ajax' value='nonce-123'>
      <input name="new_loc" value="">
    `;
    expect(parseHiddenInputs(html)).toEqual({
      action: 'login',
      'blackboard.platform.security.NonceUtil.nonce.ajax': 'nonce-123',
      new_loc: '',
    });
  });

  it('keeps cookies server-side as a header string', () => {
    const jar = new CookieJar();
    jar.add('JSESSIONID=abc; Path=/; HttpOnly');
    jar.add('s_session_id=def; Path=/; Secure');

    expect(jar.header()).toBe('JSESSIONID=abc; s_session_id=def');
  });
});
