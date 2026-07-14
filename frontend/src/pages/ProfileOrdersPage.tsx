'use client';

import { SectionCard, SectionCardContent } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { OneSecEmptyState } from '@/components/application/empty-state/OneSecEmptyState';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { ShoppingBag02 } from '@untitledui/icons';
import { useEffect, useState, useCallback } from 'react';
import { PaginationPageDefault } from '@/components/application/pagination/pagination';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';
import { RequireAuth } from '@/lib/auth/guards';
import { useCartStore } from '@/lib/cartStore';
import { useRouter } from '@/lib/navigation';

interface OrderItem {
  productId: string | number;
  title: string;
  image?: string | null;
  quantity: number;
  priceAtPurchase: number;
}

interface StatusHistoryEntry {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  changedAt: string;
  changedBy: string;
}

interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
  statusHistory?: StatusHistoryEntry[];
}

const ORDERS_PER_PAGE = 10;

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const addManyToCart = useCartStore((s) => s.addManyToCart);
  const router = useRouter();

  const copyOrderId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success(`ID заказа ${id} скопирован`);
    } catch {
      toast.error('Не удалось скопировать ID');
    }
  };

  const repeatOrder = (order: Order) => {
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

  const fetchOrders = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/orders?page=${pageNum}&limit=${ORDERS_PER_PAGE}`);
      if (!res.ok) throw new Error(await parseApiError(res, 'Не удалось загрузить заказы'));

      const data = await res.json();
      setOrders(data.orders || []);
      setPages(data.pagination?.pages ?? 1);
    } catch (error) {
      toast.error('Ошибка при загрузке заказов');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchOrders(page);
  }, [page, fetchOrders]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RequireAuth>
      <section>
        <HeaderCentered
          eyebrow="OneSec Account"
          title="Мои заказы"
          description="История ваших покупок и статусы доставки"
        />
        <div className="container mx-auto px-4 pb-10">
        <div className="mx-auto max-w-4xl">
          <SectionCard>
            <SectionCardContent className="pt-6">
              {loading ? (
                <div className="py-12 text-center text-tertiary">Загрузка...</div>
              ) : orders.length === 0 ? (
                <OneSecEmptyState
                  icon={ShoppingBag02}
                  title="У вас пока нет заказов"
                  description="Совершите свою первую покупку и она появится здесь"
                  actionLabel="Перейти к покупкам"
                  actionHref="/games"
                />
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-secondary rounded-lg p-4 hover:bg-secondary_hover transition-colors">
                      <div className="flex flex-wrap justify-between items-start mb-3">
                        <div>
                          <span className="text-sm text-tertiary">Заказ №{order.id}</span>
                          <p className="text-sm text-secondary">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' ? 'bg-success-primary text-success-primary' :
                          order.status === 'processing' ? 'bg-warning-primary text-warning-primary' :
                          order.status === 'pending' ? 'bg-brand-primary text-brand-secondary' :
                          order.status === 'refunded' ? 'bg-secondary text-tertiary' :
                          'bg-error-primary text-error-primary'
                        }`}>
                          {order.status === 'completed' ? 'Завершён' :
                           order.status === 'processing' ? 'В обработке' :
                           order.status === 'pending' ? 'Ожидает' :
                           order.status === 'refunded' ? 'Возврат' : 'Ошибка'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-secondary rounded">
                            <span className="text-secondary">{item.title} × {item.quantity}</span>
                            <span className="text-primary">{(item.priceAtPurchase * item.quantity).toFixed(2)} ₽</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-secondary">
                        <span className="font-medium text-primary">Итого:</span>
                        <span className="text-xl font-bold text-brand-secondary">{order.totalAmount} ₽</span>
                      </div>

                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <Button color="secondary" size="sm" onClick={() => copyOrderId(order.id)}>
                          Копировать ID
                        </Button>
                        <Button color="secondary" size="sm" onClick={() => repeatOrder(order)}>
                          Повторить заказ
                        </Button>
                        <Button href={`/profile/orders/${order.id}`} color="secondary" size="sm">
                          Подробнее
                        </Button>
                      </div>

                      {order.statusHistory && order.statusHistory.length > 0 && (
                        <div className="mt-3 rounded-md border border-secondary/70 bg-secondary p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-tertiary">
                            История статусов
                          </p>
                          <div className="space-y-1.5 text-xs text-secondary">
                            {order.statusHistory.map((entry, index) => (
                              <div key={`${entry.changedAt}-${index}`} className="flex items-center justify-between gap-2">
                                <span className="font-medium text-primary">{entry.status}</span>
                                <span className="text-tertiary">
                                  {new Date(entry.changedAt).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {!loading && orders.length > 0 && pages > 1 && (
                <PaginationPageDefault page={page} total={pages} className="mt-8" onPageChange={handlePageChange} />
              )}
            </SectionCardContent>
          </SectionCard>
        </div>
        </div>
      </section>
    </RequireAuth>
  );
}
