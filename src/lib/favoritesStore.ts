import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';

export type FavoriteProduct = {
  id: string | number;
  title: string;
  price: number;
  oldPrice?: number | null;
  image: string;
};

type FavoritesState = {
  items: FavoriteProduct[];
  isFavorite: (id: string | number) => boolean;
  toggleFavorite: (product: FavoriteProduct) => void;
  removeFavorite: (id: string | number) => void;
  clearFavorites: () => void;
  setItems: (items: FavoriteProduct[]) => void;
};

const isBrowser = typeof window !== 'undefined';

async function pushFavoriteToServer(product: FavoriteProduct) {
  await apiFetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

async function removeFavoriteFromServer(productId: string | number) {
  await apiFetch(`/api/favorites/${productId}`, { method: 'DELETE' });
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      isFavorite: (id) => get().items.some((item) => item.id === id),
      toggleFavorite: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          set({ items: get().items.filter((item) => item.id !== product.id) });
          if (useAuthStore.getState().user) {
            void removeFavoriteFromServer(product.id);
          }
          return;
        }
        set({ items: [...get().items, product] });
        if (useAuthStore.getState().user) {
          void pushFavoriteToServer(product);
        }
      },
      removeFavorite: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
        if (useAuthStore.getState().user) {
          void removeFavoriteFromServer(id);
        }
      },
      clearFavorites: () => set({ items: [] }),
      setItems: (items) => set({ items }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() =>
        isBrowser && 'localStorage' in window && window.localStorage
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
    }
  )
);
