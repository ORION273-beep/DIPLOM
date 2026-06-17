'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, LogIn04, SearchLg, ShoppingCart01, User01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { OneSecLogo } from '@/components/foundations/logo/onesec-logo';
import { IconCountBadge } from '@/components/layout/IconCountBadge';
import { Header } from '@/components/marketing/header-navigation/header';
import { useCartStore } from '@/lib/cartStore';
import { useFavoritesStore } from '@/lib/favoritesStore';
import { useAuthStore } from '@/lib/auth/store';

const navItems = [
  { label: 'Игровая валюта', href: '/catalog/currency' },
  { label: 'Игры', href: '/games' },
  { label: 'Подписки', href: '/catalog/subscriptions' },
];

export function OneSecHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));
  const favoritesCount = useFavoritesStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/catalog?q=${encodeURIComponent(q)}`);
  };

  const searchForm = (
    <form onSubmit={handleSearch}>
      <Input
        type="search"
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Поиск товаров..."
        icon={SearchLg}
        size="sm"
      />
    </form>
  );

  return (
    <Header
      className="sticky top-0 z-50 border-b border-secondary bg-primary/90 backdrop-blur-xl"
      items={navItems}
      hideAuthButtons
      hideMobileFooter
      logo={
        <>
          <OneSecLogo href="/" showTagline className="hidden sm:flex" />
          <OneSecLogo href="/" className="sm:hidden" />
        </>
      }
      search={searchForm}
      mobileExtra={searchForm}
      actions={
        <>
          <div className="relative">
            <Button
              color="tertiary"
              size="sm"
              href="/favorites"
              iconLeading={Heart}
              aria-label={favoritesCount > 0 ? `Избранное, ${favoritesCount}` : 'Избранное'}
            />
            <IconCountBadge count={favoritesCount} color="error" />
          </div>
          <div className="relative">
            <Button
              color="tertiary"
              size="sm"
              href="/cart"
              iconLeading={ShoppingCart01}
              aria-label={totalItems > 0 ? `Корзина, ${totalItems}` : 'Корзина'}
            />
            <IconCountBadge count={totalItems} />
          </div>
          {user ? (
            <Button color="tertiary" size="sm" href="/profile" iconLeading={User01} aria-label="Профиль" />
          ) : (
            <Button color="tertiary" size="sm" href="/login" iconLeading={LogIn04} aria-label="Войти" />
          )}
        </>
      }
    />
  );
}
