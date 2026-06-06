import { describe, expect, it } from 'vitest';
import { CookieJar, normalizeSchool, normalizeUser, parseHiddenInputs } from './_blackboard';

describe('Blackboard connector helpers', () => {
  it('normalizes Blackboard school subdomains', () => {
    expect(normalizeSchool('https://school.blackboard.com/')).toEqual({
      school: 'school',
      origin: 'https://school.blackboard.com',
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

  it('does not treat a student number as the display name', () => {
    expect(normalizeUser({
      id: '_123',
      name: 'm041975',
      userName: 'm041975',
    })).toMatchObject({
      id: '_123',
      name: 'Student',
      studentId: 'm041975',
      userName: 'm041975',
    });
  });

  it('keeps real Blackboard profile names when available', () => {
    expect(normalizeUser({
      id: '_123',
      givenName: 'Alejandro',
      familyName: 'Apodaca',
      userName: 'm041975',
    })).toMatchObject({
      name: 'Alejandro Apodaca',
      studentId: 'm041975',
    });
  });
});
