import { useAuthStore, type AuthUser } from '@/lib/auth/store';

export async function refreshSession(): Promise<boolean> {
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
  } catch {
    return false;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshSessionDeduped(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = refreshSession().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/** Browser SPA: always same-origin `/api/...` (Vite proxy → backend :4000). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = path.startsWith('/') ? path : `/${path}`;
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(init.headers);
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && !path.includes('/api/auth/refresh')) {
    const refreshed = await refreshSessionDeduped();
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
