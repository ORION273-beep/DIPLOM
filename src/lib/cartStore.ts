import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';

export type Product = {
  id: string | number;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  gameSlug?: string;
  category?: string;
  platform?: 'mobile' | 'pc';
  inStock?: boolean;
};

type CartItem = Product & { quantity: number };

type CartState = {
  items: CartItem[];
  addToCart: (product: Product) => void;
  addManyToCart: (products: CartItem[]) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setItems: (items: CartItem[]) => void;
};

const isBrowser = typeof window !== 'undefined';

async function pushCartItemToServer(item: CartItem) {
  await apiFetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

async function updateCartItemOnServer(productId: string | number, quantity: number) {
  await apiFetch(`/api/cart/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
}

async function removeCartItemFromServer(productId: string | number) {
  await apiFetch(`/api/cart/${productId}`, { method: 'DELETE' });
}

async function clearCartOnServer() {
  await apiFetch('/api/cart', { method: 'DELETE' });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.id === product.id);
        let next: CartItem[];
        if (existing) {
          next = items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          next = [...items, { ...product, quantity: 1 }];
        }
        set({ items: next });
        if (useAuthStore.getState().user) {
          const item = next.find((i) => i.id === product.id);
          if (item) void pushCartItemToServer(item);
        }
      },
      addManyToCart: (products) => {
        const next = [...get().items];
        for (const product of products) {
          const existing = next.find((i) => i.id === product.id);
          if (existing) {
            existing.quantity += product.quantity;
          } else {
            next.push({ ...product });
          }
        }
        set({ items: next });
        if (useAuthStore.getState().user) {
          for (const item of products) {
            const merged = next.find((i) => i.id === item.id);
            if (merged) void pushCartItemToServer(merged);
          }
        }
      },
      removeFromCart: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
        if (useAuthStore.getState().user) {
          void removeCartItemFromServer(id);
        }
      },
      updateQuantity: (id, qty) => {
        if (qty < 1) return;
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        });
        if (useAuthStore.getState().user) {
          void updateCartItemOnServer(id, qty);
        }
      },
      clearCart: () => {
        set({ items: [] });
        if (useAuthStore.getState().user) {
          void clearCartOnServer();
        }
      },
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      setItems: (items) => set({ items }),
    }),
    {
      name: 'cart-storage',
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
