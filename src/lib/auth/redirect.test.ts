import { describe, expect, it } from 'vitest';
import { buildLoginUrl, parseLoginReason, sanitizeReturnPath } from '@/lib/auth/redirect';

describe('auth redirect', () => {
  it('buildLoginUrl without params returns /login', () => {
    expect(buildLoginUrl()).toBe('/login');
  });

  it('buildLoginUrl with return path adds next', () => {
    expect(buildLoginUrl('/cart')).toBe('/login?next=%2Fcart');
  });

  it('buildLoginUrl with reason only adds reason', () => {
    expect(buildLoginUrl(null, 'cart')).toBe('/login?reason=cart');
  });

  it('buildLoginUrl with return path and reason', () => {
    expect(buildLoginUrl('/catalog/subscriptions', 'favorites')).toBe(
      '/login?next=%2Fcatalog%2Fsubscriptions&reason=favorites',
    );
  });

  it('sanitizeReturnPath rejects external URLs', () => {
    expect(sanitizeReturnPath('https://evil.com')).toBe('/');
  });

  it('parseLoginReason validates reason', () => {
    expect(parseLoginReason('cart')).toBe('cart');
    expect(parseLoginReason('favorites')).toBe('favorites');
    expect(parseLoginReason('invalid')).toBeNull();
    expect(parseLoginReason(null)).toBeNull();
  });
});
