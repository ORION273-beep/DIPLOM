'use client';

import { useEffect } from 'react';
import { useRouter } from '@/lib/navigation';

/** Сохраняем URL /orders — перенаправляем на актуальную страницу заказов в профиле */
export default function OrdersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile/orders');
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-tertiary">
      Перенаправление…
    </div>
  );
}
