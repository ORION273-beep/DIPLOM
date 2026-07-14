import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/commerce/ProductCard';
import { Button } from '@/components/base/buttons/button';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { PageLoader } from '@/components/ui/PageLoader';
import { fetchProducts, type Product } from '@/lib/api/products';

export default function PromotionsPage() {
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { products, error: e } = await fetchProducts({ discount: '1', limit: '12' });
      if (cancelled) return;
      setPromoProducts(products);
      setError(e);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader label="Загрузка..." />;

  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Offers"
        title="Акции и спецпредложения"
        description="Подборка предложений с максимальной выгодой. Обновляем список акций регулярно."
      />

      <div className="container mx-auto px-4 pb-10">
        <SectionCard className="mb-8 border-brand/30 bg-brand-solid/10">
          <SectionCardHeader>
            <SectionCardTitle className="text-brand-secondary">Как получить лучшую цену</SectionCardTitle>
            <SectionCardDescription className="text-brand-secondary">
              Сравнивайте предложения и проверяйте размер скидки на карточке товара.
            </SectionCardDescription>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Отрицательный процент на бейдже показывает актуальную скидку.</p>
            <p>- Акционные товары могут закончиться быстрее обычных.</p>
            <p>- Перед оплатой проверяйте правильность данных аккаунта.</p>
          </SectionCardContent>
        </SectionCard>

        {error ? (
          <SectionCard className="border-red-800/50 bg-red-900/20">
            <SectionCardHeader>
              <SectionCardTitle className="text-red-200">{error}</SectionCardTitle>
            </SectionCardHeader>
          </SectionCard>
        ) : promoProducts.length === 0 ? (
          <SectionCard className="border-secondary bg-secondary">
            <SectionCardHeader>
              <SectionCardTitle className="text-primary">Сейчас нет активных скидок</SectionCardTitle>
              <SectionCardDescription>
                Откройте популярные товары — там чаще всего появляются новые предложения.
              </SectionCardDescription>
            </SectionCardHeader>
            <SectionCardContent>
              <Button href="/catalog?sort=popular" color="primary">
                Популярные товары
              </Button>
            </SectionCardContent>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {promoProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
