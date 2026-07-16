import { useEffect, useState } from 'react';
import { useParams } from '@/lib/navigation';
import { toast } from 'sonner';
import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { apiFetch } from '@/lib/api/client';
import { RequireAuth } from '@/lib/auth/guards';
import { useCartStore } from '@/lib/cartStore';
import { useRouter } from '@/lib/navigation';

type OrderItem = {
  productId: string | number;
  title: string;
  image?: string | null;
  quantity: number;
  priceAtPurchase: number;
};

type StatusHistoryEntry = {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  changedAt: string;
  changedBy: string;
};

type Order = {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
  statusHistory?: StatusHistoryEntry[];
};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const addManyToCart = useCartStore((s) => s.addManyToCart);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(params.id);
      toast.success(`ID заказа ${params.id} скопирован`);
    } catch {
      toast.error('Не удалось скопировать ID');
    }
  };

  const repeatOrder = () => {
    if (!order) return;
    addManyToCart(
      order.items.map((item) => ({
        id: item.productId,
        title: item.title,
        price: item.priceAtPurchase,
        image: item.image || '/placeholder.svg',
        quantity: item.quantity,
      }))
    );
    toast.success('Товары из заказа добавлены в корзину');
    router.push('/cart');
  };

  useEffect(() => {
    const run = async () => {
      try {
        const res = await apiFetch(`/api/orders/${params.id}`);
        if (!res.ok) throw new Error('Не удалось загрузить заказ');
        const data = await res.json();
        setOrder(data.order ?? null);
      } catch (error) {
        toast.error('Не удалось загрузить заказ');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params.id]);

  return (
    <RequireAuth>
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <SectionCard>
            <SectionCardHeader>
              <SectionCardTitle>Детали заказа</SectionCardTitle>
              <SectionCardDescription>Статус и состав заказа №{params.id}</SectionCardDescription>
            </SectionCardHeader>
            <SectionCardContent>
              {loading ? (
                <div className="text-tertiary">Загрузка...</div>
              ) : !order ? (
                <div className="space-y-4">
                  <p className="text-secondary">Заказ не найден.</p>
                  <Button href="/profile/orders" color="secondary">Назад к заказам</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-secondary bg-secondary p-4">
                    <p className="text-sm text-tertiary">Дата создания</p>
                    <p className="text-primary">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-secondary bg-secondary/50 p-3"
                      >
                        <span className="text-primary">
                          {item.title} × {item.quantity}
                        </span>
                        <span className="text-brand-secondary">
                          {(item.priceAtPurchase * item.quantity).toFixed(2)} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="rounded-lg border border-secondary bg-secondary p-4">
                      <p className="mb-2 text-sm font-semibold text-secondary">История статусов</p>
                      <div className="space-y-1 text-sm text-secondary">
                        {order.statusHistory.map((entry, idx) => (
                          <div key={`${entry.changedAt}-${idx}`} className="flex justify-between gap-3">
                            <span>{entry.status}</span>
                            <span className="text-tertiary">
                              {new Date(entry.changedAt).toLocaleString('ru-RU')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-secondary pt-3">
                    <div className="flex flex-wrap gap-2">
                      <Button href="/profile/orders" color="secondary">Назад к заказам</Button>
                      <Button color="secondary" onClick={copyOrderId}>
                        Копировать ID
                      </Button>
                      <Button onClick={repeatOrder} >
                        Повторить заказ
                      </Button>
                    </div>
                    <div className="text-xl font-bold text-brand-secondary">{order.totalAmount} ₽</div>
                  </div>
                </div>
              )}
            </SectionCardContent>
          </SectionCard>
        </div>
      </section>
    </RequireAuth>
  );
}

