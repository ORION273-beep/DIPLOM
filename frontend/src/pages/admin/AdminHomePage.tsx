'use client';

import { useEffect, useState } from 'react';
import {
  BarChartSquare02,
  Home01,
  HelpCircle,
  MessageChatSquare,
  Package,
  ShoppingBag02,
  Users01,
} from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';
import { useAuthStore } from '@/lib/auth/store';
import { apiFetch } from '@/lib/api/client';

type Stats = {
  orderCount: number;
  productCount: number;
  userCount: number;
  revenue: number;
  ordersByStatus: Record<string, number>;
  topProducts: Array<{ title: string; quantity: number }>;
};

const sections = [
  { href: '/admin/orders', icon: ShoppingBag02, title: 'Заказы', desc: 'Просмотр и управление заказами' },
  { href: '/admin/products', icon: Package, title: 'Товары', desc: 'Создание и редактирование каталога' },
  { href: '/admin/games', icon: Home01, title: 'Игры', desc: 'Управление играми в каталоге' },
  { href: '/admin/users', icon: Users01, title: 'Пользователи', desc: 'Роли, баланс, блокировка' },
  { href: '/admin/reviews', icon: MessageChatSquare, title: 'Отзывы', desc: 'Модерация отзывов' },
  { href: '/admin/faq', icon: HelpCircle, title: 'FAQ', desc: 'Вопросы и ответы' },
];

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await apiFetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-secondary bg-primary p-6 shadow-xs ring-1 ring-secondary">
          <h1 className="text-display-xs font-semibold text-primary">Админ-панель</h1>
          <p className="mt-1 text-sm text-tertiary">Управление заказами, каталогом и контентом</p>
          <p className="mt-4 text-secondary">Добро пожаловать, {user?.email?.split('@')[0]}!</p>

          {stats && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-secondary bg-secondary p-4">
                <FeaturedIcon icon={BarChartSquare02} color="brand" theme="modern" size="sm" />
                <p className="mt-3 text-2xl font-semibold text-primary">{stats.revenue.toLocaleString('ru-RU')} ₽</p>
                <p className="text-sm text-tertiary">Выручка (completed)</p>
              </div>
              <div className="rounded-xl border border-secondary bg-secondary p-4">
                <p className="text-2xl font-semibold text-primary">{stats.orderCount}</p>
                <p className="text-sm text-tertiary">Заказов всего</p>
              </div>
              <div className="rounded-xl border border-secondary bg-secondary p-4">
                <p className="text-2xl font-semibold text-primary">{stats.userCount}</p>
                <p className="text-sm text-tertiary">Пользователей</p>
              </div>
              <div className="rounded-xl border border-secondary bg-secondary p-4">
                <p className="text-2xl font-semibold text-primary">{stats.productCount}</p>
                <p className="text-sm text-tertiary">Товаров</p>
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <div key={s.href} className="rounded-xl border border-secondary bg-secondary p-5">
                <FeaturedIcon icon={s.icon} color="brand" theme="modern" size="md" />
                <h2 className="mt-4 text-md font-semibold text-primary">{s.title}</h2>
                <p className="mt-1 text-sm text-tertiary">{s.desc}</p>
                <Button color="primary" size="sm" href={s.href} className="mt-4">
                  Открыть
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
