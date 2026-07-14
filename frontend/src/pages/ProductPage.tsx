import { useEffect, useState } from 'react';
import { useParams } from '@/lib/navigation';
import { Button } from '@/components/base/buttons/button';
import { PageLoader } from '@/components/ui/PageLoader';
import { ProductDetail, type ProductDetailData } from '@/pages/ProductDetail';

export default function ProductPage() {
  const { id = '' } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          if (!cancelled) {
            setProduct(null);
            setError(true);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setProduct(data.product ?? null);
          setError(!(data.product));
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <PageLoader label="Загрузка товара..." />;

  if (error || !product) {
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
