import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/commerce/ProductCard';
import { PopularGameCard } from '@/components/catalog/PopularGameCard';
import { HeroSplitImage02 } from '@/components/marketing/header-section/hero-split-image-02';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { PageLoader } from '@/components/ui/PageLoader';

type Product = {
  id: string | number;
  title: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  popular?: boolean;
};

type Game = {
  id: string | number;
  slug: string;
  name: string;
  cover: string;
  genres?: string[];
  popular?: boolean;
};

export default function HomePage() {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [productsRes, gamesRes] = await Promise.all([
          fetch('/api/products?popular=1'),
          fetch('/api/games'),
        ]);

        if (!productsRes.ok || !gamesRes.ok) {
          if (!cancelled) {
            setError('Не удалось загрузить данные с сервера. Убедитесь, что backend запущен.');
            setRecommendedProducts([]);
            setPopularGames([]);
          }
          return;
        }

        const productsData = await productsRes.json();
        const gamesData = await gamesRes.json();
        if (cancelled) return;
        setRecommendedProducts(productsData.products ?? []);
        setPopularGames((gamesData.games ?? []).filter((game: Game) => game.popular));
        setError(null);
      } catch {
        if (!cancelled) {
          setError('Сервер недоступен. Запустите backend на :4000 и frontend на :5173.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader label="Загрузка..." />;

  const heroMainGame = popularGames[0];
  const heroDecorGames = popularGames.slice(1, 3);

  return (
    <div>
      <HeroSplitImage02
        eyebrow="OneSec 2026"
        title="Самый выгодный"
        titleHighlight="донат-магазин"
        description="Быстрые поставки, выгодные цены и лучший сервис. Моментальная доставка после оплаты."
        primaryCta={{ label: 'В каталог', href: '/catalog' }}
        secondaryCta={{ label: 'Популярные игры', href: '/games' }}
        imageSrc={heroMainGame?.cover}
        imageAlt={heroMainGame?.name}
        decorGameCovers={heroDecorGames.map((game) => ({ src: game.cover, alt: game.name }))}
      />

      {error && (
        <div className="container mx-auto px-4 pt-8">
          <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-6 text-center text-red-200">
            {error}
          </div>
        </div>
      )}

      <HeaderCentered
        eyebrow="Каталог"
        title="Рекомендованные товары"
        description="Популярные предложения с лучшими ценами"
        className="py-12 md:py-16"
      />
      <div className="container mx-auto px-4 pb-12">
        {recommendedProducts.length === 0 ? (
          <p className="text-center text-quaternary">Популярные товары скоро появятся</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <section className="border-t border-secondary bg-secondary_alt">
        <HeaderCentered
          eyebrow="Игры"
          title="Популярные игры"
          description="Выберите игру и пополните баланс за пару кликов"
          className="pb-8 pt-12 md:pb-10 md:pt-16"
        />
        <div className="container mx-auto px-4 pb-12 md:pb-16">
          {popularGames.length === 0 ? (
            <p className="text-center text-quaternary">Игры скоро появятся</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {popularGames.map((game, index) => (
                  <PopularGameCard key={game.id} game={game} />
                ))}
              </div>
              <div className="mt-8 flex justify-center md:mt-10">
                <Link
                  to="/games"
                  className="inline-flex items-center gap-2 rounded-xl border border-secondary bg-primary px-5 py-2.5 text-sm font-semibold text-primary shadow-xs transition-all hover:border-brand/50 hover:bg-primary_hover"
                >
                  Все игры
                  <span aria-hidden className="text-tertiary">
                    →
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
