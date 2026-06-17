import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';
import { useFavoritesStore, type FavoriteProduct } from '@/lib/favoritesStore';

export async function syncFavoritesFromServer(): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) return;

  try {
    const res = await apiFetch('/api/favorites');
    if (!res.ok) return;
    const data = (await res.json()) as { favorites?: FavoriteProduct[] };
    if (Array.isArray(data.favorites)) {
      useFavoritesStore.setState({ items: data.favorites });
    }
  } catch {
    /* ignore sync errors */
  }
}

export async function pushFavoriteToServer(product: FavoriteProduct): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) return;

  await apiFetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

export async function removeFavoriteFromServer(productId: string | number): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) return;

  await apiFetch(`/api/favorites/${productId}`, { method: 'DELETE' });
}
