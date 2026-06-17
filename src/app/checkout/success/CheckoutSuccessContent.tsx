'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/base/buttons/button';
import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <section className="container mx-auto max-w-lg px-4 py-16">
      <SectionCard className="border-brand/30 bg-brand-solid/10">
        <SectionCardHeader className="text-center">
          <SectionCardTitle className="text-2xl text-brand-secondary">Оплата успешна</SectionCardTitle>
          <SectionCardDescription className="text-tertiary">
            Заказ принят в обработку. Цифровой товар будет доставлен в ближайшее время.
          </SectionCardDescription>
        </SectionCardHeader>
        <SectionCardContent className="space-y-4 text-center">
          {orderId && (
            <p className="text-secondary">
              Номер заказа: <span className="font-mono text-brand-secondary">{orderId}</span>
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/profile/orders" color="primary">Мои заказы</Button>
            <Button href="/catalog" color="secondary">Продолжить покупки</Button>
          </div>
        </SectionCardContent>
      </SectionCard>
    </section>
  );
}
