'use client';

import { useEffect } from 'react';
import { Button } from '@/components/base/buttons/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold text-primary">Ошибка админ-панели</h2>
      <p className="mt-2 text-secondary">{error.message || 'Что-то пошло не так'}</p>
      <Button color="primary" className="mt-6" onClick={reset}>
        Повторить
      </Button>
    </div>
  );
}
