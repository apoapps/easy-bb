import { describe, expect, it } from 'vitest';
import { getApiBaseUrl, shouldUseDemoMode } from './apiConfig';

describe('apiConfig', () => {
  it('disables demo mode on production builds even when ?demo=1 is present', () => {
    const demoMode = shouldUseDemoMode({
      dev: false,
      urlSearch: '?demo=1',
      protocol: 'https:',
      hostname: 'easy-bb.vercel.app',
    });

    expect(demoMode).toBe(false);
  });

  it('allows explicit demo mode only during local development', () => {
    const demoMode = shouldUseDemoMode({
      dev: true,
      urlSearch: '?demo=1',
      protocol: 'http:',
      hostname: 'localhost',
    });

    expect(demoMode).toBe(true);
  });

  it('always uses the same Next.js origin for API paths', () => {
    const apiBase = getApiBaseUrl('https://easy-bb.vercel.app/');

    expect(apiBase).toBe('https://easy-bb.vercel.app');
  });
});
