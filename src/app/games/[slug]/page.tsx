// app/games/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Monitor01, Phone01, Star01 } from "@untitledui/icons";
import { OneSecEmptyState } from "@/components/application/empty-state/OneSecEmptyState";
import { Button } from "@/components/base/buttons/button";
import { ProductCard } from "@/components/commerce/ProductCard";
import { serverApiUrl } from "@/lib/api/client";

interface Game {
  id: string | number;
  slug: string;
  name: string;
  cover: string;
  genres: string[];
  platforms: string[];
  description: string;
  popular?: boolean;
}

interface Product {
  id: string | number;
  title: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  gameSlug: string;
}

async function getGame(slug: string): Promise<Game | null> {
  try {
    const res = await fetch(serverApiUrl(`/api/games/${encodeURIComponent(slug)}`), {
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.game || null;
  } catch (error) {
    console.error("Ошибка загрузки игры:", error);
    return null;
  }
}

async function getProductsForGame(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(serverApiUrl(`/api/products?gameSlug=${encodeURIComponent(slug)}`), {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
    return [];
  }
}

export default async function GamePage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {

  const params = await paramsPromise;
  const slug = params.slug;

  const [game, products] = await Promise.all([
    getGame(slug),
    getProductsForGame(slug),
  ]);

  if (!game) notFound();
  const genres = game.genres ?? [];
  const platforms = game.platforms ?? [];

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Навигация назад */}
      <Link
        href="/games"
        className="mb-6 inline-flex items-center gap-2 text-sm text-tertiary hover:text-brand-secondary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Все игры
      </Link>

      {/* Hero секция игры */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-secondary to-secondary_hover p-8 lg:p-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Обложка игры */}
          <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl lg:aspect-[4/3] lg:mb-0">
            <Image
              src={game.cover}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />

            {/* Бейдж популярности */}
            {game.popular && (
              <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 px-3 py-1.5 text-xs font-bold text-black shadow-lg backdrop-blur-sm">
                <Star01 className="size-3" />
                Популярная
              </div>
            )}
          </div>

          {/* Информация об игре */}
          <div className="space-y-6 lg:pt-4">
            <div>
              <h1 className="text-display-sm font-semibold tracking-tight text-primary lg:text-display-md">
                {game.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-secondary">
                {genres.map((genre, i) => (
                  <span key={i} className="rounded-full bg-secondary_hover px-3 py-1">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg leading-relaxed text-secondary lg:text-xl">
              {game.description}
            </p>

            {/* Платформы */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-tertiary">
                <Monitor01 className="size-4" />
                Доступно на
              </h3>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-lg bg-brand-solid/10 px-3 py-1.5 text-xs font-medium text-brand-secondary"
                  >
                    {platform.includes("Android") || platform.includes("iOS") ? (
                      <Phone01 className="size-3" />
                    ) : (
                      <Monitor01 className="size-3" />
                    )}
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Товары для этой игры */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Товары для <span className="text-brand-secondary">{game.name}</span>
          </h2>
          <span className="text-sm text-quaternary">
            {products.length} товаров
          </span>
        </div>

        {products.length === 0 ? (
          <OneSecEmptyState
            title="Товары скоро появятся"
            description="Мы постоянно пополняем ассортимент. Следите за обновлениями!"
            actionLabel="Весь каталог"
            actionHref="/catalog"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA блок */}
      {products.length > 0 && (
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-600/10 to-brand-500/5 p-8 text-center lg:p-12">
          <h3 className="mb-3 text-xl font-bold text-brand-secondary lg:text-2xl">
            Не нашли нужное?
          </h3>
          <Button
            href="/catalog"
            color="primary"
            iconTrailing={
              <ArrowRight
                data-icon="trailing"
                className="pointer-events-none size-5 shrink-0 transition-inherit-all"
              />
            }
          >
            Посмотреть весь каталог
          </Button>
        </div>
      )}
    </div>
  );
}