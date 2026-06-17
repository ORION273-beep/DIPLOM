'use client';

import { CheckCircle, CreditCard02, Loading01, ShieldTick, Zap } from '@untitledui/icons';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { FeaturedIcon } from '@/components/foundations/featured-icon/featured-icon';

type PaymentInDevelopmentModalProps = {
  productTitle: string;
  productPrice: number;
  onClose?: () => void;
};

export function PaymentInDevelopmentModal({
  productTitle,
  productPrice,
  onClose,
}: PaymentInDevelopmentModalProps) {
  return (
    <div className="relative overflow-hidden rounded-xl p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-brand-solid/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-warning-solid/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-full bg-warning-solid/15 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-3 rounded-full ring-1 ring-warning/30 animate-pulse"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-warning/20 animate-spin"
            />
            <FeaturedIcon icon={Loading01} color="warning" theme="gradient" size="xl" className="relative z-10" />
          </div>
          <Badge color="warning" size="sm" type="pill-color" className="mt-4">
            В разработке
          </Badge>
          <h2 className="mt-4 text-xl font-semibold text-primary">Сервис оплаты скоро будет готов</h2>
          <p className="mt-2 max-w-sm text-sm text-tertiary">
            Мы собираем платёжный модуль OneSec. Пока что оформление заказа временно недоступно.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-brand/25 bg-gradient-to-br from-brand-solid/20 to-brand-700/5 p-4">
            <CreditCard02 className="size-6 text-brand-secondary" />
            <p className="mt-3 text-sm font-semibold text-primary">Карты</p>
            <p className="mt-1 text-xs text-tertiary">Подключаем быстрые платежи</p>
          </div>

          <div className="rounded-2xl border border-warning/25 bg-gradient-to-br from-warning-solid/15 to-warning-700/5 p-4">
            <Zap className="size-6 text-warning-400" />
            <p className="mt-3 text-sm font-semibold text-primary">СБП / QR</p>
            <p className="mt-1 text-xs text-tertiary">Готовим мгновенную оплату</p>
          </div>

          <div className="rounded-2xl border border-success/25 bg-gradient-to-br from-success-solid/15 to-success-700/5 p-4">
            <ShieldTick className="size-6 text-success-400" />
            <p className="mt-3 text-sm font-semibold text-primary">Безопасность</p>
            <p className="mt-1 text-xs text-tertiary">Дополнительная защита транзакций</p>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-brand/30 bg-brand-solid/5 p-4">
          <CheckCircle className="mt-0.5 size-5 shrink-0 text-brand-secondary" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">Ваш выбор сохранён в корзине</p>
            <p className="mt-1 truncate text-sm text-secondary">{productTitle}</p>
            <p className="mt-1 text-sm font-semibold text-brand-secondary">{productPrice} ₽</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button slot="close" color="secondary" onClick={onClose}>
            Закрыть
          </Button>
          <Button slot="close" color="primary" href="/cart">
            Перейти в корзину
          </Button>
        </div>
      </div>
    </div>
  );
}
