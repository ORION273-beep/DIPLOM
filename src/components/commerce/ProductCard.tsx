'use client';

import Link from 'next/link';
import { Heart, ShoppingCart01 } from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { useCartStore } from '@/lib/cartStore';
import { useFavoritesStore } from '@/lib/favoritesStore';
import { cx } from '@/utils/cx';

type Product = {
  id: string | number;
  title: string;
  price: number;
  oldPrice?: number | null;
  image: string;
};

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.items.some((item) => item.id === product.id));

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite(product);
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs transition-all hover:border-brand hover:shadow-md">
      <div className="relative aspect-4/3 overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {discount > 0 && (
          <Badge color="error" size="sm" className="absolute left-3 top-3">
            -{discount}%
          </Badge>
        )}

        <Button
          color="tertiary"
          size="sm"
          className="absolute right-3 top-3 bg-primary/80 backdrop-blur-sm"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
        >
          <Heart className={cx('size-4', isFavorite && 'fill-current text-error-primary')} />
        </Button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 min-h-11 text-sm font-semibold text-primary transition-colors hover:text-brand-secondary">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-brand-secondary">{product.price} ₽</span>
          {product.oldPrice && (
            <span className="text-sm text-quaternary line-through">{product.oldPrice} ₽</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button color="primary" size="sm" href={`/product/${product.id}`} className="flex-1">
            Купить
          </Button>
          <Button
            color="secondary"
            size="sm"
            onClick={handleAddToCart}
            aria-label="В корзину"
          >
            <ShoppingCart01 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
