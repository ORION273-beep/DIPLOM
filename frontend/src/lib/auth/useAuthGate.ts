'use client';

import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth/store';
import { buildLoginUrl, LOGIN_REASON_MESSAGES, type LoginReason } from '@/lib/auth/redirect';
import { useReturnPath } from '@/lib/auth/returnPath';
import { refreshSession } from '@/lib/api/client';

/** Gate actions behind resolved auth state; redirect to login when needed. */
export function useAuthGate() {
  const router = useRouter();
  const returnPath = useReturnPath();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const authReady = useAuthStore((s) => s.authReady);

  const ensureAuth = async (
    path: string = returnPath,
    reason?: LoginReason,
  ): Promise<boolean> => {
    if (!authReady) return false;

    if (user || accessToken) return true;

    const refreshed = await refreshSession();
    const state = useAuthStore.getState();
    if (refreshed && (state.user || state.accessToken)) return true;

    if (reason) {
      toast.info(LOGIN_REASON_MESSAGES[reason]);
    }

    router.replace(buildLoginUrl(path, reason));
    return false;
  };

  return { user, authReady, ensureAuth, returnPath };
}
