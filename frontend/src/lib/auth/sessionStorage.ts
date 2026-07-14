import type { AuthUser } from './store';

const STORAGE_KEY = 'onesec_auth';

type StoredSession = {
  user: AuthUser;
  accessToken: string;
};

export function loadStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed.user?.id || !parsed.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredSession(user: AuthUser, accessToken: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken }));
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
