import { Heart } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { OneSecEmptyState } from '@/components/application/empty-state/OneSecEmptyState';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { ProductCard } from '@/components/commerce/ProductCard';
import { RequireAuth } from '@/lib/auth/guards';
import { useFavoritesStore } from '@/lib/favoritesStore';

export default function FavoritesPage() {
  return (
    <RequireAuth loginReason="favorites">
      <FavoritesPageContent />
    </RequireAuth>
  );
}

function FavoritesPageContent() {
  const items = useFavoritesStore((s) => s.items);
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);

  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Wishlist"
        title="Избранное"
        description="Список избранных товаров. Добавляйте позиции с карточек товаров для быстрого доступа."
      />

      <div className="container mx-auto px-4 pb-10">
      {items.length === 0 ? (
        <OneSecEmptyState
          icon={Heart}
          title="Пока список пуст"
          description="Добавляйте товары в избранное на карточках, чтобы быстрее возвращаться к ним позже"
          actionLabel="Открыть игры"
          actionHref="/games"
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-tertiary">Товаров в избранном: {items.length}</p>
            <Button color="secondary" size="sm" onClick={clearFavorites}>
              Очистить список
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button color="primary" href="/games">
          Открыть игры
        </Button>
        <Button color="secondary" href="/catalog">
          Перейти в каталог
        </Button>
      </div>
      </div>
    </section>
  );
}
