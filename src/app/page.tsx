import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/commerce/ProductCard';
import { HeroSplitImage02 } from '@/components/marketing/header-section/hero-split-image-02';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { serverApiUrl } from '@/lib/api/client';

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
  popular?: boolean;
};

async function getHomeData(): Promise<{
  recommendedProducts: Product[];
  popularGames: Game[];
  error: string | null;
}> {
  try {
    const [productsRes, gamesRes] = await Promise.all([
      fetch(serverApiUrl('/api/products?popular=1'), { cache: 'no-store' }),
      fetch(serverApiUrl('/api/games'), { cache: 'no-store' }),
    ]);

    if (!productsRes.ok || !gamesRes.ok) {
      return {
        recommendedProducts: [],
        popularGames: [],
        error: 'Не удалось загрузить данные с сервера. Убедитесь, что backend запущен.',
      };
    }

    const productsData = await productsRes.json();
    const gamesData = await gamesRes.json();

    const recommendedProducts = productsData.products ?? [];
    const popularGames = (gamesData.games ?? []).filter((game: Game) => game.popular);

    return { recommendedProducts, popularGames, error: null };
  } catch {
    return {
      recommendedProducts: [],
      popularGames: [],
      error: 'Сервер недоступен. Запустите проект командой npm run dev:all.',
    };
  }
}

export default async function HomePage() {
  const { recommendedProducts, popularGames, error } = await getHomeData();

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

      <HeaderCentered
        eyebrow="Игры"
        title="Популярные игры"
        description="Выберите игру и пополните баланс за пару кликов"
        className="py-12 md:py-16"
      />
      <div className="container mx-auto px-4 pb-12">
        {popularGames.length === 0 ? (
          <p className="text-center text-quaternary">Игры скоро появятся</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {popularGames.map((game) => (
              <Link key={game.id} href={`/games/${game.slug}`} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={game.cover}
                    alt={game.name}
                    width={200}
                    height={280}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <p className="absolute bottom-2 left-2 right-2 text-sm font-semibold text-fg-white opacity-0 transition-opacity group-hover:opacity-100">
                    {game.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
