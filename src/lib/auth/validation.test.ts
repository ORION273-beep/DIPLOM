import { describe, expect, it } from 'vitest';
import { getEmailError, getLoginPasswordError } from '@/lib/auth/validation';

describe('auth validation', () => {
  it('rejects empty email', () => {
    expect(getEmailError('')).toBeTruthy();
  });

  it('accepts valid email', () => {
    expect(getEmailError('user@example.com')).toBeUndefined();
  });

  it('rejects short password on login', () => {
    expect(getLoginPasswordError('')).toBeTruthy();
  });

  it('accepts non-empty password on login', () => {
    expect(getLoginPasswordError('secret123')).toBeUndefined();
  });
});
