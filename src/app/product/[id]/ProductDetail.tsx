'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, ShoppingCart01 } from '@untitledui/icons';
import { cn } from '@/lib/cn';
import {
  Dialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
} from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { useCartStore } from '@/lib/cartStore';
import { useFavoritesStore } from '@/lib/favoritesStore';
import { toast } from 'sonner';
import { PaymentInDevelopmentModal } from '@/components/commerce/PaymentInDevelopmentModal';
import { isLocalProductArt, isPubgMobileProduct, PubgUcBackdrop } from '@/components/commerce/ProductMediaFrame';

export type ProductDetailData = {
  id: string | number;
  title: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  description: string;
  category: string;
  platform: 'mobile' | 'pc';
  inStock: boolean;
  details?: string[];
  popular?: boolean;
};

type ProductDetailProps = {
  product: ProductDetailData;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const favoriteItems = useFavoritesStore((s) => s.items);
  const router = useRouter();
  const { ensureAuth } = useAuthGate();
  const [showPaymentDev, setShowPaymentDev] = useState(false);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const isInStock = product.inStock !== false;
  const isFavorite = favoriteItems.some((item) => item.id === product.id);
  const isPubg = isPubgMobileProduct({ category: product.category, image: product.image });
  const isLocalArt = isLocalProductArt(product.image);

  const handleBuyNow = async () => {
    if (!(await ensureAuth(undefined, 'cart'))) return;
    clearCart();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      oldPrice: product.oldPrice ?? undefined,
      image: product.image,
      gameSlug: product.category,
      category: product.category,
      platform: product.platform,
      inStock: product.inStock,
    });
    // Оплата в разработке: вместо редиректа показываем креативную таблицу в модалке
    setShowPaymentDev(true);
  };

  const handleAddToCart = async () => {
    if (!(await ensureAuth(undefined, 'cart'))) return;
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      oldPrice: product.oldPrice ?? undefined,
      image: product.image,
      gameSlug: product.category,
      category: product.category,
      platform: product.platform,
      inStock: product.inStock,
    });
    toast.success(`«${product.title}» добавлен в корзину`, {
      action: {
        label: 'Перейти в корзину',
        onClick: () => router.push('/cart'),
      },
    });
  };

  const handleToggleFavorite = async () => {
    if (!(await ensureAuth(undefined, 'favorites'))) return;
    toggleFavorite({
      id: product.id,
      title: product.title,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <Link
        href="/games"
        className="mb-6 inline-flex items-center gap-2 text-sm text-tertiary hover:text-brand-secondary"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад в каталог
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative overflow-hidden rounded-2xl border border-secondary">
          <div className={cn('relative aspect-square', !isPubg && !isLocalArt && 'bg-secondary', isLocalArt && 'bg-black')}>
            {isPubg && <PubgUcBackdrop className="rounded-2xl" />}
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.title}
              fill
              className={cn(
                isPubg
                  ? 'z-10 object-contain p-4 scale-[1.12] drop-shadow-[0_16px_40px_rgba(0,0,0,0.4)]'
                  : isLocalArt
                    ? 'object-contain p-4'
                    : 'object-cover',
              )}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />

            {discount > 0 && (
              <div className="absolute left-4 top-4 z-20 rounded-full bg-error-solid px-3 py-1.5 text-sm font-bold text-fg-white shadow-lg">
                -{discount}%
              </div>
            )}

            {product.popular && (
              <div className="absolute right-4 top-4 z-20 rounded-full bg-orange-600 px-3 py-1.5 text-sm font-bold text-fg-white shadow-lg">
                Хит
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-lg bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary">
                {product.platform === 'mobile' ? 'Мобильные' : 'ПК'}
              </span>
              <span className="text-sm text-quaternary">
                Категория:{' '}
                <span className="capitalize">{product.category.replace('-', ' ')}</span>
              </span>
            </div>

            <h1 className="mb-4 text-2xl font-bold leading-tight lg:text-3xl">{product.title}</h1>

            <p className="mb-8 text-secondary">{product.description}</p>

            {product.details && product.details.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3 text-sm font-semibold uppercase text-tertiary">Характеристики</h3>
                <ul className="space-y-2 text-sm text-secondary">
                  {product.details.map((detail, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-brand-secondary">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-secondary p-6">
            <div className="mb-6 flex items-end gap-4">
              <div>
                <div className="text-3xl font-bold text-brand-secondary lg:text-4xl">{product.price} ₽</div>
                {product.oldPrice && (
                  <div className="text-lg text-quaternary line-through">{product.oldPrice} ₽</div>
                )}
              </div>

              {isInStock ? (
                <span className="text-sm font-medium text-brand-secondary">В наличии</span>
              ) : (
                <span className="text-sm font-medium text-red-400">Нет в наличии</span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DialogTrigger>
                <Button
                  color="primary"
                  size="lg"
                  className="w-full"
                  isDisabled={!isInStock}
                  iconLeading={ShoppingCart01}
                  onClick={() => setShowPaymentDev(false)}
                >
                  {isInStock ? 'Купить сразу' : 'Нет в наличии'}
                </Button>
                <ModalOverlay>
                  <Modal className="w-full max-w-xl">
                    <Dialog className="p-0">
                      {showPaymentDev ? (
                        <PaymentInDevelopmentModal
                          productTitle={product.title}
                          productPrice={product.price}
                          onClose={() => setShowPaymentDev(false)}
                        />
                      ) : (
                        <div className="p-6">
                          <h2 className="text-lg font-semibold text-primary">Подтверждение покупки</h2>
                          <p className="mt-2 text-sm text-tertiary">
                            Вы уверены, что хотите приобрести &quot;{product.title}&quot; за {product.price}{' '}
                            ₽? Вы перейдёте к оформлению заказа.
                          </p>

                          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button slot="close" color="secondary">
                              Отмена
                            </Button>
                            <Button color="primary" onClick={handleBuyNow}>
                              Перейти к оплате
                            </Button>
                          </div>
                        </div>
                      )}
                    </Dialog>
                  </Modal>
                </ModalOverlay>
              </DialogTrigger>

              <Button
                color="secondary"
                size="lg"
                className="btn-cart-press w-full"
                isDisabled={!isInStock}
                iconLeading={ShoppingCart01}
                onClick={handleAddToCart}
              >
                {isInStock ? 'В корзину' : 'Нет в наличии'}
              </Button>
            </div>

            <Button
              color="secondary"
              size="md"
              className={cn(
                'mt-3 w-full',
                isFavorite && 'border-pink-500/50 bg-pink-500/10 text-pink-300'
              )}
              iconLeading={Heart}
              onClick={handleToggleFavorite}
            >
              {isFavorite ? 'В избранном' : 'В избранное'}
            </Button>

            <p className="mt-4 text-center text-xs text-quaternary">Моментальная доставка после оплаты</p>
          </div>
        </div>
      </div>
    </div>
  );
}
