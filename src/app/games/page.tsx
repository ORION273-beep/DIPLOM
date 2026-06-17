import Image from 'next/image';
import Link from 'next/link';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { serverApiUrl } from '@/lib/api/client';

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

async function getGames(): Promise<{ games: Game[]; error: string | null }> {
  try {
    const res = await fetch(serverApiUrl('/api/games'), { cache: 'no-store' });
    if (!res.ok) {
      return { games: [], error: 'Не удалось загрузить список игр. Проверьте, что backend запущен.' };
    }
    const data = await res.json();
    return { games: data.games || [], error: null };
  } catch {
    return { games: [], error: 'Сервер недоступен. Запустите проект командой npm run dev:all.' };
  }
}

export default async function GamesPage() {
  const { games, error } = await getGames();

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

  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Games"
        title="Популярные игры"
        description={`${games.length} игр с цифровыми товарами и быстрой доставкой`}
      />

      <div className="container mx-auto grid grid-cols-1 gap-5 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/games/${game.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-secondary bg-secondary transition-all hover:border-brand/50 hover:bg-secondary active:scale-[0.98]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-primary">
              <Image
                src={game.cover}
                alt={game.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={game.popular}
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

export const revalidate = 3600;
