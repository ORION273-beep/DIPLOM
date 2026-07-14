'use client';

import { useEffect } from 'react';
import { useRouter } from '@/lib/navigation';
import { useAuthStore } from '@/lib/auth/store';
import { buildLoginUrl, type LoginReason } from '@/lib/auth/redirect';
import { useReturnPath } from '@/lib/auth/returnPath';

export function RequireAuth({
  children,
  loginReason,
}: {
  children: React.ReactNode;
  loginReason?: LoginReason;
}) {
  const router = useRouter();
  const returnPath = useReturnPath();
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace(buildLoginUrl(returnPath, loginReason));
    }
  }, [authReady, user, router, returnPath, loginReason]);

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-tertiary">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const returnPath = useReturnPath();
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace(buildLoginUrl(returnPath));
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/');
    }
  }, [authReady, user, router, returnPath]);

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-tertiary">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
