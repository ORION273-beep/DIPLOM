import { apiFetch } from '@/lib/api/client';
import { useAuthStore } from '@/lib/auth/store';
import { useCartStore, type Product } from '@/lib/cartStore';

type CartItem = Product & { quantity: number };

export async function syncCartFromServer(): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) return;

  try {
    const res = await apiFetch('/api/cart');
    if (!res.ok) return;
    const data = (await res.json()) as { items?: CartItem[] };
    if (Array.isArray(data.items)) {
      useCartStore.getState().setItems(data.items);
    }
  } catch {
    /* ignore sync errors */
  }
}

export async function mergeLocalCartToServer(): Promise<void> {
  const user = useAuthStore.getState().user;
  if (!user) return;

  const localItems = useCartStore.getState().items;
  if (localItems.length === 0) {
    await syncCartFromServer();
    return;
  }

  try {
    const res = await apiFetch('/api/cart/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: localItems }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { items?: CartItem[] };
    if (Array.isArray(data.items)) {
      useCartStore.getState().setItems(data.items);
    }
  } catch {
    /* ignore */
  }
}
