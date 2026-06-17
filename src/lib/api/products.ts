import { serverApiUrl } from '@/lib/api/client';

export type Product = {
  id: string | number;
  title: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  category?: string;
  platform?: string;
  popular?: boolean;
  inStock?: boolean;
  gameSlug?: string | null;
};

export type ProductQuery = {
  sort?: string;
  q?: string;
  category?: string;
  platform?: string;
  min?: string;
  max?: string;
  inStock?: string;
  discount?: string;
  popular?: string;
  gameSlug?: string;
  currency?: string;
  page?: string;
  limit?: string;
};

export type ProductsResponse = {
  products: Product[];
  pagination?: { page: number; limit: number; total: number; pages: number };
  error: string | null;
};

export function buildProductsUrl(params: ProductQuery = {}) {
  const search = new URLSearchParams();
  if (params.sort) search.set('sort', params.sort);
  if (params.q?.trim()) search.set('q', params.q.trim());
  if (params.category) search.set('category', params.category);
  if (params.platform) search.set('platform', params.platform);
  if (params.min) search.set('min', params.min);
  if (params.max) search.set('max', params.max);
  if (params.inStock === '1') search.set('inStock', '1');
  if (params.discount === '1') search.set('discount', '1');
  if (params.popular === '1') search.set('popular', '1');
  if (params.gameSlug) search.set('gameSlug', params.gameSlug);
  if (params.currency === '1') search.set('currency', '1');
  if (params.page) search.set('page', params.page);
  if (params.limit) search.set('limit', params.limit);
  const qs = search.toString();
  return serverApiUrl(`/api/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProducts(params: ProductQuery = {}): Promise<ProductsResponse> {
  try {
    const res = await fetch(buildProductsUrl(params), { cache: 'no-store' });
    if (!res.ok) {
      return { products: [], error: 'Не удалось загрузить товары. Попробуйте обновить страницу.' };
    }
    const data = await res.json();
    return {
      products: data.products ?? [],
      pagination: data.pagination,
      error: null,
    };
  } catch {
    return { products: [], error: 'Сервер недоступен. Проверьте, что backend запущен.' };
  }
}

export type Category = {
  id: string;
  name: string;
  icon?: string | null;
  type?: string | null;
};

export async function fetchCategories(): Promise<{ categories: Category[]; error: string | null }> {
  try {
    const res = await fetch(serverApiUrl('/api/categories'), { cache: 'no-store' });
    if (!res.ok) {
      return { categories: [], error: 'Не удалось загрузить категории' };
    }
    const data = await res.json();
    return { categories: data.categories ?? [], error: null };
  } catch {
    return { categories: [], error: 'Сервер недоступен' };
  }
}
