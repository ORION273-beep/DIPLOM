'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/store';
import { buildLoginUrl } from '@/lib/auth/redirect';

function useReturnPath(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const returnPath = useReturnPath();
  const user = useAuthStore((s) => s.user);
  const authReady = useAuthStore((s) => s.authReady);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace(buildLoginUrl(returnPath));
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
