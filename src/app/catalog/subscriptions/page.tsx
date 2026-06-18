import { ProductCard } from '@/components/commerce/ProductCard';
import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { SubscriptionsHubHeader } from '@/components/marketing/header-section/subscriptions-hub-header';
import { fetchProducts } from '@/lib/api/products';

export default async function SubscriptionsPage() {
  const { products: items, error } = await fetchProducts({ category: 'subscriptions' });

  return (
    <section>
      <SubscriptionsHubHeader
        eyebrow="OneSec Subscription Hub"
        title="Подписки"
        description="Цифровые подписки для популярных сервисов с быстрой выдачей и прозрачной ценой."
      />

      <div className="container mx-auto px-4 pb-10">
      <SectionCard className="mb-8 border-brand/30 bg-brand-solid/10">
        <SectionCardHeader>
          <SectionCardTitle className="text-brand-secondary">Как работает покупка подписки</SectionCardTitle>
          <SectionCardDescription className="text-brand-secondary">
            Оформите заказ, оплатите и получите инструкции по активации в личном кабинете.
          </SectionCardDescription>
        </SectionCardHeader>
        <SectionCardContent className="space-y-1 text-secondary">
          <p>- Выберите подходящий сервис и срок.</p>
          <p>- Проверьте данные перед оплатой.</p>
          <p>- Отслеживайте статус заказа в профиле.</p>
        </SectionCardContent>
      </SectionCard>

      {error ? (
        <SectionCard className="border-red-800/50 bg-red-900/20">
          <SectionCardHeader>
            <SectionCardTitle className="text-red-200">{error}</SectionCardTitle>
          </SectionCardHeader>
        </SectionCard>
      ) : items.length === 0 ? (
        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">Раздел скоро пополнится</SectionCardTitle>
            <SectionCardDescription>
              Подписки появятся после обновления базы данных. Проверьте каталог немного позже.
            </SectionCardDescription>
          </SectionCardHeader>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/catalog" color="primary">Весь каталог</Button>
        <Button href="/contacts" color="secondary">Нужна консультация</Button>
      </div>
      </div>
    </section>
  );
}

