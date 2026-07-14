import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GamesHubHeader } from '@/components/marketing/header-section/games-hub-header';
import { PageLoader } from '@/components/ui/PageLoader';

interface Game {
  id: string | number;
  slug: string;
  name: string;
  cover: string;
  genres?: string[];
  platforms?: string[];
  description?: string;
  popular?: boolean;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/games');
        if (!res.ok) {
          if (!cancelled) setError('Не удалось загрузить список игр. Проверьте, что backend запущен.');
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setGames(data.games || []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('Сервер недоступен. Запустите backend на :4000.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader label="Загрузка игр..." />;

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-3xl font-bold">Игры</h1>
        <p className="text-lg text-red-300">{error}</p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-3xl font-bold">Игры</h1>
        <p className="text-lg text-tertiary">Список игр пока пуст</p>
      </div>
    );
  }

  const decorCovers = games
    .filter((game) => game.popular)
    .concat(games.filter((game) => !game.popular))
    .slice(0, 4)
    .map((game) => ({ src: game.cover, alt: game.name }));

  return (
    <section>
      <GamesHubHeader
        eyebrow="OneSec Games"
        title="Популярные игры"
        description={`${games.length} игр с цифровыми товарами и быстрой доставкой`}
        decorCovers={decorCovers}
      />

      <div className="container mx-auto grid grid-cols-1 gap-5 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {games.map((game) => (
          <Link
            key={game.slug}
            to={`/games/${game.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-secondary bg-secondary transition-all hover:border-brand/50 hover:bg-secondary active:scale-[0.98]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-primary">
              <img
                src={game.cover}
                alt={game.name}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-1 line-clamp-2 font-medium leading-tight">{game.name}</h3>
              {game.genres && game.genres.length > 0 && (
                <p className="mt-auto line-clamp-1 text-xs text-tertiary">{game.genres.join(' • ')}</p>
              )}
            </div>

            {game.popular && (
              <div className="absolute right-3 top-3 rounded-full bg-orange-600/90 px-2.5 py-1 text-xs font-bold text-fg-white backdrop-blur-sm">
                Популярная
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
