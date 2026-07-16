import { useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/lib/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { RadioGroup, RadioButton } from '@/components/base/radio-buttons/radio-buttons';
import { OneSecEmptyState } from '@/components/application/empty-state/OneSecEmptyState';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { ShoppingCart01 } from '@untitledui/icons';
import { buildLoginUrl } from '@/lib/auth/redirect';
import { apiFetch } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';
import { useAuthStore } from '@/lib/auth/store';
import { useCartStore } from '@/lib/cartStore';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Банковская карта', description: 'Visa, Mastercard, МИР' },
  { id: 'sbp', label: 'СБП', description: 'Оплата по QR-коду' },
  { id: 'balance', label: 'Баланс OneSec', description: 'Списание с внутреннего баланса' },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]['id'];

type StockInfo = {
  id: string;
  stock: number;
  inStock: boolean;
  title: string;
};

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [submitting, setSubmitting] = useState(false);
  const [stockMap, setStockMap] = useState<Record<string, StockInfo>>({});
  const [balance, setBalance] = useState(user?.balance ?? 0);
  const total = useMemo(() => getTotalPrice(), [getTotalPrice, items]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [meRes, ...productRes] = await Promise.all([
          apiFetch('/api/auth/me'),
          ...items.map((item) => apiFetch(`/api/products/${item.id}`)),
        ]);
        if (meRes.ok) {
          const me = await meRes.json();
          if (typeof me.user?.balance === 'number') setBalance(me.user.balance);
        }
        const map: Record<string, StockInfo> = {};
        for (let i = 0; i < items.length; i += 1) {
          const res = productRes[i];
          if (res?.ok) {
            const data = await res.json();
            const p = data.product;
            if (p) {
              map[String(items[i].id)] = {
                id: String(p.id),
                stock: p.stock ?? 0,
                inStock: p.inStock !== false,
                title: p.title,
              };
            }
          }
        }
        setStockMap(map);
      } catch {
        /* ignore */
      }
    };
    void load();
  }, [user, items]);

  const stockIssues = items.filter((item) => {
    const info = stockMap[String(item.id)];
    if (!info) return false;
    return !info.inStock || info.stock < item.quantity;
  });

  if (!user) {
    return (
      <section>
        <HeaderCentered eyebrow="OneSec Checkout" title="Оплата заказа" />
        <div className="container mx-auto px-4 pb-10">
          <OneSecEmptyState
            title="Требуется авторизация"
            description="Для оформления заказа необходимо войти в аккаунт"
            actionLabel="Войти"
            actionHref={buildLoginUrl('/checkout')}
          />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section>
        <HeaderCentered eyebrow="OneSec Checkout" title="Оплата заказа" />
        <div className="container mx-auto px-4 pb-10">
          <OneSecEmptyState
            icon={ShoppingCart01}
            title="Корзина пуста"
            description="Добавьте товары в корзину перед оформлением заказа"
            actionLabel="В каталог"
            actionHref="/catalog"
          />
        </div>
      </section>
    );
  }

  const insufficientBalance = method === 'balance' && balance < total;

  const handlePay = async () => {
    if (stockIssues.length > 0) {
      toast.error('Некоторые товары недоступны в нужном количестве');
      return;
    }
    if (insufficientBalance) {
      toast.error('Недостаточно средств на балансе OneSec');
      return;
    }
    setSubmitting(true);
    try {
      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `order-${Date.now()}`;

      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: method,
          idempotencyKey,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res, 'Не удалось оформить заказ'));
      }

      const data = await res.json();
      clearCart();
      toast.success('Оплата прошла успешно');
      router.push(`/checkout/success?orderId=${encodeURIComponent(data.order.id)}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка оплаты');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Checkout"
        title="Оплата заказа"
        description="Выберите способ оплаты и подтвердите покупку"
      />

      <div className="container mx-auto max-w-3xl px-4 pb-10">
        {stockIssues.length > 0 && (
          <div className="mb-6 rounded-xl border border-error-secondary bg-error-primary p-4 text-sm text-error-primary">
            <p className="font-medium">Некоторые товары недоступны:</p>
            <ul className="mt-2 list-inside list-disc">
              {stockIssues.map((item) => {
                const info = stockMap[String(item.id)];
                return (
                  <li key={item.id}>
                    {item.title} — доступно: {info?.stock ?? 0}, в корзине: {item.quantity}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <RadioGroup
          value={method}
          onChange={(value) => setMethod(value as PaymentMethod)}
          className="mb-8 gap-3"
        >
          {PAYMENT_METHODS.map((pm) => (
            <RadioButton
              key={pm.id}
              value={pm.id}
              label={pm.label}
              hint={
                pm.id === 'balance'
                  ? `${pm.description}. Доступно: ${balance.toLocaleString('ru-RU')} ₽`
                  : pm.description
              }
              size="md"
              className="w-full rounded-xl border border-secondary bg-secondary p-4 data-selected:border-brand data-selected:bg-brand-solid/10"
            />
          ))}
        </RadioGroup>

        {insufficientBalance && (
          <p className="mb-4 text-sm text-error-primary">
            Недостаточно средств на балансе. Не хватает {(total - balance).toLocaleString('ru-RU')} ₽
          </p>
        )}

        <div className="mb-8 rounded-xl border border-secondary bg-secondary p-4">
          <h2 className="mb-4 font-semibold text-primary">Состав заказа</h2>
          <div className="space-y-3">
            {items.map((item) => {
              const info = stockMap[String(item.id)];
              const lowStock = info && (info.stock < item.quantity || !info.inStock);
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-secondary">
                    <img
                      src={item.image || '/placeholder.svg'}
                      alt={item.title}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${lowStock ? 'text-error-primary' : 'text-primary'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-quaternary">
                      × {item.quantity}
                      {info && ` · в наличии: ${info.stock}`}
                    </p>
                  </div>
                  <p className="text-brand-secondary">{item.price * item.quantity} ₽</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-secondary pt-4 text-right text-lg font-semibold text-brand-secondary">
            Итого: {total} ₽
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button color="secondary" href="/cart">
            Назад в корзину
          </Button>
          <Button
            color="primary"
            onClick={handlePay}
            isDisabled={submitting || stockIssues.length > 0 || insufficientBalance}
          >
            {submitting ? 'Обработка...' : `Оплатить ${total} ₽`}
          </Button>
        </div>
      </div>
    </section>
  );
}
