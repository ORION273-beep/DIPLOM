import { useAuthStore, type AuthUser } from '@/lib/auth/store';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getBackendBaseUrl(): string {
  const base = process.env.BACKEND_URL?.replace(/\/$/, '') ?? '';
  if (!base) {
    throw new Error('BACKEND_URL is required for server-side fetch');
  }
  return base;
}

/** Server Components / Route Handlers: absolute URL to backend. */
export function serverApiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${getBackendBaseUrl()}${p}`;
}

let refreshInFlight: Promise<boolean> | null = null;

export async function refreshSession(): Promise<boolean> {
  if (!isBrowser()) return false;
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        return false;
      }
      const data = (await res.json()) as { user?: AuthUser; accessToken?: string };
      if (data.user && data.accessToken) {
        useAuthStore.getState().setSession(data.user, data.accessToken);
        return true;
      }
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

/**
 * Browser: same-origin `/api/...` (Next rewrite → backend).
 * Server: absolute `BACKEND_URL/api/...`.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const p = path.startsWith('/') ? path : `/${path}`;
  const url = isBrowser() ? p : serverApiUrl(p);
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(init.headers);
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: isBrowser() ? 'include' : init.credentials ?? 'omit',
  });

  if (res.status === 401 && isBrowser() && !path.includes('/api/auth/refresh')) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const token2 = useAuthStore.getState().accessToken;
      const h2 = new Headers(init.headers);
      if (token2) h2.set('Authorization', `Bearer ${token2}`);
      return fetch(url, {
        ...init,
        headers: h2,
        credentials: 'include',
      });
    }
  }

  return res;
}

export async function logoutClient(): Promise<void> {
  await apiFetch('/api/auth/logout', { method: 'POST' });
  useAuthStore.getState().clear();
}
