import { describe, expect, it } from 'vitest';
import { getBackendBaseUrl } from './_shared';

describe('getBackendBaseUrl', () => {
  it('uses BACKEND_API_BASE_URL first and normalizes trailing slashes', () => {
    expect(getBackendBaseUrl({ BACKEND_API_BASE_URL: 'https://api.easy-bb.app///' })).toBe('https://api.easy-bb.app');
  });

  it('falls back to NEXT_PUBLIC_API_BASE_URL', () => {
    expect(getBackendBaseUrl({ NEXT_PUBLIC_API_BASE_URL: 'https://public-api.easy-bb.app/' })).toBe('https://public-api.easy-bb.app');
  });

  it('returns null when no backend is configured', () => {
    expect(getBackendBaseUrl({})).toBeNull();
  });
});
