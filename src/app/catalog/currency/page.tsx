import { ProductCard } from '@/components/commerce/ProductCard';
import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { CurrencyHubHeader } from '@/components/marketing/header-section/currency-hub-header';
import { fetchProducts, type Product } from '@/lib/api/products';

const gameLabels: Record<string, string> = {
  'pubg-mobile': 'PUBG Mobile',
  'genshin-impact': 'Genshin Impact',
  'free-fire': 'Garena Free Fire',
  'brawl-stars': 'Brawl Stars',
  minecraft: 'Minecraft',
  roblox: 'Roblox',
};

export default async function CurrencyPage() {
  const { products, error } = await fetchProducts({ currency: '1', limit: '100' });
  const grouped = products.reduce<Record<string, Product[]>>((acc, item) => {
    const key = ((item.gameSlug ?? item.category ?? 'other') as string).toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const orderedGroups = Object.entries(grouped).sort(([a], [b]) => {
    const ai = Object.keys(gameLabels).indexOf(a);
    const bi = Object.keys(gameLabels).indexOf(b);
    const av = ai === -1 ? 999 : ai;
    const bv = bi === -1 ? 999 : bi;
    return av - bv;
  });

  return (
    <section>
      <CurrencyHubHeader
        eyebrow="OneSec Currency"
        title="Игровая валюта"
        description="Пополнение внутриигровой валюты для популярных игр. Поддерживаются актуальные пакеты и быстрый выпуск заказов."
      />

      <div className="container mx-auto px-4 pb-10">
      <SectionCard className="mb-8 border-brand/30 bg-brand-solid/10">
        <SectionCardHeader>
          <SectionCardTitle className="text-brand-secondary">Перед оплатой</SectionCardTitle>
          <SectionCardDescription className="text-brand-secondary">
            Убедитесь, что указали корректный игровой аккаунт и регион.
          </SectionCardDescription>
        </SectionCardHeader>
        <SectionCardContent className="space-y-1 text-secondary">
          <p>- Проверяйте никнейм/ID аккаунта перед оформлением.</p>
          <p>- Выбирайте пакет с оптимальной стоимостью за единицу валюты.</p>
          <p>- Отслеживайте выполнение заказа в личном кабинете.</p>
        </SectionCardContent>
      </SectionCard>

      {error ? (
        <SectionCard className="border-red-800/50 bg-red-900/20">
          <SectionCardHeader>
            <SectionCardTitle className="text-red-200">{error}</SectionCardTitle>
          </SectionCardHeader>
        </SectionCard>
      ) : products.length === 0 ? (
        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">Раздел пуст</SectionCardTitle>
            <SectionCardDescription>Сейчас нет доступных товаров игровой валюты.</SectionCardDescription>
          </SectionCardHeader>
        </SectionCard>
      ) : (
        <div className="space-y-10">
          {orderedGroups.map(([group, items]) => (
            <div key={group}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-primary">
                  {gameLabels[group] ?? group}
                </h2>
                <span className="text-xs text-quaternary">{items.length} товаров</span>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/games" color="primary">Открыть игры</Button>
        <Button href="/catalog" color="secondary">Весь каталог</Button>
      </div>
      </div>
    </section>
  );
}

