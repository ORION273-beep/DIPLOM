import { describe, expect, it } from 'vitest';
import { buildLoginUrl, getPostLoginPath, sanitizeReturnPath } from './redirect';

describe('auth redirect', () => {
  it('defaults to home when next is missing', () => {
    expect(getPostLoginPath(null)).toBe('/');
    expect(buildLoginUrl(null)).toBe('/login');
  });

  it('returns to protected page when next is set', () => {
    expect(getPostLoginPath('/checkout')).toBe('/checkout');
    expect(buildLoginUrl('/checkout')).toBe('/login?next=%2Fcheckout');
  });

  it('rejects external and auth paths', () => {
    expect(sanitizeReturnPath('//evil.com')).toBe('/');
    expect(sanitizeReturnPath('/login')).toBe('/');
    expect(sanitizeReturnPath('/register')).toBe('/');
  });
});
