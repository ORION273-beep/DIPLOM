'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart01, HelpCircle, Home01, MessageChatSquare, Package, ShoppingBag01, Users01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { OneSecLogo } from '@/components/foundations/logo/onesec-logo';
import { RequireAdmin } from '@/lib/auth/guards';
import { cx } from '@/utils/cx';

const navItems = [
  { label: 'Главная', href: '/admin', icon: Home01 },
  { label: 'Заказы', href: '/admin/orders', icon: ShoppingBag01 },
  { label: 'Товары', href: '/admin/products', icon: Package },
  { label: 'Игры', href: '/admin/games', icon: Home01 },
  { label: 'Пользователи', href: '/admin/users', icon: Users01 },
  { label: 'Отзывы', href: '/admin/reviews', icon: MessageChatSquare },
  { label: 'FAQ', href: '/admin/faq', icon: HelpCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RequireAdmin>
      <div className="flex min-h-screen bg-secondary">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-secondary bg-primary lg:flex">
          <div className="border-b border-secondary px-5 py-5">
            <OneSecLogo href="/admin" />
            <p className="mt-2 flex items-center gap-2 text-xs text-tertiary">
              <BarChart01 className="size-3.5" />
              Админ-панель
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-primary text-brand-secondary'
                      : 'text-secondary hover:bg-secondary_hover hover:text-primary'
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-secondary p-4">
            <Button color="secondary" size="sm" href="/profile" className="w-full">
              В профиль
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-secondary bg-primary px-4 py-4 lg:hidden">
            <OneSecLogo href="/admin" />
            <Button color="secondary" size="sm" href="/profile">
              Профиль
            </Button>
          </header>
          <nav className="flex gap-2 overflow-x-auto border-b border-secondary bg-primary px-4 py-2 lg:hidden">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cx(
                    'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium',
                    active ? 'bg-brand-primary text-brand-secondary' : 'text-tertiary'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <main className="mx-auto w-full max-w-container flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </RequireAdmin>
  );
}
