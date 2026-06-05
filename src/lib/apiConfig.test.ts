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

  it('uses the configured production API base instead of localhost', () => {
    const apiBase = getApiBaseUrl({
      configuredApiBaseUrl: 'https://api.easy-bb.app',
      origin: 'https://easy-bb.vercel.app',
    });

    expect(apiBase).toBe('https://api.easy-bb.app');
  });

  it('falls back to same-origin API paths in production', () => {
    const apiBase = getApiBaseUrl({
      origin: 'https://easy-bb.vercel.app',
    });

    expect(apiBase).toBe('https://easy-bb.vercel.app');
  });
});
