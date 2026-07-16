import { Link } from 'react-router-dom';
import { ArrowUpRight } from '@untitledui/icons';

export type PopularGameCardGame = {
  id: string | number;
  slug: string;
  name: string;
  cover: string;
  genres?: string[];
};

export function PopularGameCard({
  game,
}: {
  game: PopularGameCardGame;
}) {
  const genreLine = game.genres?.slice(0, 2).join(' · ');

  return (
    <Link
      to={`/games/${game.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-secondary bg-primary shadow-xs transition-colors duration-300 hover:border-brand/40 hover:shadow-lg"
    >
      <div className="relative aspect-3/4 overflow-hidden bg-secondary">
        <img
          src={game.cover}
          alt={game.name}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute right-2.5 top-2.5 rounded-full bg-brand-solid/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fg-white backdrop-blur-sm">
          Топ
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-fg-white md:text-md">
                {game.name}
              </h3>
              {genreLine && (
                <p className="mt-1 line-clamp-1 text-xs text-fg-white/75">{genreLine}</p>
              )}
            </div>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-fg-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              <ArrowUpRight className="size-4" aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
