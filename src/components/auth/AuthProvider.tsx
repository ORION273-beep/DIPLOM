'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth/store';
import { syncFavoritesFromServer } from '@/lib/favoritesSync';
import { mergeLocalCartToServer } from '@/lib/cartSync';
import { refreshSession } from '@/lib/api/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      hydrateFromStorage();
      try {
        const refreshed = await refreshSession();
        if (cancelled) return;
        if (!refreshed) {
          const { accessToken, user } = useAuthStore.getState();
          if (!accessToken || !user) {
            clear();
          }
        } else {
          void syncFavoritesFromServer();
          void mergeLocalCartToServer();
        }
      } catch {
        if (!cancelled) {
          const { accessToken, user } = useAuthStore.getState();
          if (!accessToken || !user) clear();
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setSession, clear, setAuthReady, hydrateFromStorage]);

  return <>{children}</>;
}
