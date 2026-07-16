import { useMemo, useState } from 'react';
import { Minus, Plus, ShoppingCart01, Trash01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { cx } from '@/utils/cx';
import { OneSecEmptyState } from '@/components/application/empty-state/OneSecEmptyState';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { RequireAuth } from '@/lib/auth/guards';
import { useAuthGate } from '@/lib/auth/useAuthGate';
import { useCartStore } from '@/lib/cartStore';
import { useRouter } from '@/lib/navigation';

export default function CartPage() {
  return (
    <RequireAuth loginReason="cart">
      <CartPageContent />
    </RequireAuth>
  );
}

function CartPageContent() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const { ensureAuth } = useAuthGate();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const handleCheckout = async () => {
    if (!(await ensureAuth('/checkout', 'cart'))) return;
    if (items.length === 0) return;
    setSubmitting(true);
    router.push('/checkout');
    setSubmitting(false);
  };

  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Cart"
        title="Корзина"
        description="Проверьте выбранные товары перед покупкой"
      />

      <div className="container mx-auto px-4 pb-10">
      {items.length === 0 ? (
        <OneSecEmptyState
          icon={ShoppingCart01}
          title="Корзина пока пустая"
          description="Добавьте товары из каталога, чтобы оформить заказ"
          actionLabel="Перейти к каталогу игр"
          actionHref="/games"
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-secondary bg-secondary p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-secondary">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-primary">{item.title}</p>
                    <p className="mt-1 text-xs text-quaternary">{item.price} ₽ за шт.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-8 items-center overflow-hidden rounded-lg">
                    <button
                      type="button"
                      aria-label="Уменьшить количество"
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className={cx(
                        'flex size-8 items-center justify-center text-fg-quaternary transition hover:bg-primary_hover hover:text-secondary outline-focus-ring focus:outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-40',
                      )}
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-8 px-1 text-center text-sm tabular-nums text-secondary">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Увеличить количество"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className={cx(
                        'flex size-8 items-center justify-center text-fg-quaternary transition hover:bg-primary_hover hover:text-secondary outline-focus-ring focus:outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2',
                      )}
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label="Удалить из корзины"
                    onClick={() => removeFromCart(item.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-fg-quaternary transition hover:bg-primary_hover hover:text-error-primary outline-focus-ring focus:outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Trash01 className="size-4" />
                  </button>
                  <p className="min-w-20 text-right font-medium text-brand-secondary">
                    {item.price * item.quantity} ₽
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-secondary bg-secondary p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-primary">Итого</span>
              <span className="text-2xl font-bold text-brand-secondary">{total} ₽</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button color="secondary" onClick={clearCart}>
                Очистить корзину
              </Button>
              <Button color="primary" onClick={handleCheckout} isDisabled={submitting}>
                {submitting ? 'Переход...' : 'Оформить заказ'}
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
