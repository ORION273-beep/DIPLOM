'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/store';
import { buildLoginUrl } from '@/lib/auth/redirect';
import { refreshSession } from '@/lib/api/client';

/** Gate actions behind resolved auth state; redirect to login when needed. */
export function useAuthGate() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const authReady = useAuthStore((s) => s.authReady);

  const ensureAuth = async (returnPath: string): Promise<boolean> => {
    if (!authReady) return false;

    // If we already have an access token, we consider the user authenticated
    // even if `user` is temporarily null during hydration.
    if (user || accessToken) return true;

    const refreshed = await refreshSession();
    const state = useAuthStore.getState();
    if (refreshed && (state.user || state.accessToken)) return true;

    router.replace(buildLoginUrl(returnPath));
    return false;
  };

  return { user, authReady, ensureAuth };
}
