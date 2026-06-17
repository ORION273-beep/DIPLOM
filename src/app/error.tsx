'use client';

import { useEffect } from 'react';
import { Button } from '@/components/base/buttons/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-bold text-primary">Что-то пошло не так</h1>
      <p className="mb-6 max-w-md text-tertiary">
        Не удалось загрузить страницу. Попробуйте обновить или вернуться на главную.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} color="primary">
          Повторить
        </Button>
        <Button href="/" color="secondary">
          На главную
        </Button>
      </div>
    </div>
  );
}
