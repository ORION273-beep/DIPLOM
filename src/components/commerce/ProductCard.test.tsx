import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/commerce/ProductCard';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/lib/cartStore', () => ({
  useCartStore: (selector: (s: { addToCart: () => void }) => unknown) =>
    selector({ addToCart: vi.fn() }),
}));

vi.mock('@/lib/favoritesStore', () => ({
  useFavoritesStore: (selector: (s: { toggleFavorite: () => void; items: [] }) => unknown) =>
    selector({ toggleFavorite: vi.fn(), items: [] }),
}));

vi.mock('@/lib/auth/useAuthGate', () => ({
  useAuthGate: () => ({
    ensureAuth: vi.fn().mockResolvedValue(true),
    returnPath: '/',
    user: null,
    authReady: true,
  }),
}));

describe('ProductCard', () => {
  it('renders product title and price', () => {
    render(
      <ProductCard
        product={{
          id: '1',
          title: 'PUBG UC 100',
          price: 99,
          image: '/test.png',
        }}
      />
    );
    expect(screen.getByText('PUBG UC 100')).toBeInTheDocument();
    expect(screen.getByText(/99/)).toBeInTheDocument();
  });

  it('shows discount badge when oldPrice is set', () => {
    render(
      <ProductCard
        product={{
          id: '2',
          title: 'Genshin Crystals',
          price: 80,
          oldPrice: 100,
          image: '/test.png',
        }}
      />
    );
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });
});
