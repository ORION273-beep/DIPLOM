import type { Metadata } from 'next';
import { Button } from '@/components/base/buttons/button';
import { serverApiUrl } from '@/lib/api/client';
import { ProductDetail, type ProductDetailData } from './ProductDetail';

async function fetchProduct(id: string): Promise<ProductDetailData | null> {
  const res = await fetch(serverApiUrl(`/api/products/${id}`), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Ошибка загрузки товара');
  }

  const data = await res.json();
  return data.product ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await fetchProduct(id);
    if (!product) {
      return { title: 'Товар не найден | OneSec' };
    }
    return {
      title: `${product.title} | OneSec`,
      description: product.description,
    };
  } catch {
    return { title: 'Товар | OneSec' };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold text-error-primary">Товар не найден (404)</h1>
        <p className="mt-4 text-secondary">Возможно, товар удалён или ссылка неверная.</p>
        <Button href="/catalog" color="primary" className="mt-8">
          ← Вернуться в каталог
        </Button>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
