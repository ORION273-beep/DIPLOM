import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/base/buttons/button';
import { Select } from '@/components/base/select/select';
import { Table, TableCard } from '@/components/application/table/table';
import { PaginationPageDefault } from '@/components/application/pagination/pagination';
import { apiFetch } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';

interface OrderItem {
  productId: string | number;
  title: string;
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  id: string;
  userId: string;
  userEmail?: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

const ORDERS_PER_PAGE = 15;

const columns = [
  { id: 'id', label: 'ID' },
  { id: 'user', label: 'Пользователь' },
  { id: 'date', label: 'Дата' },
  { id: 'amount', label: 'Сумма' },
  { id: 'status', label: 'Статус' },
  { id: 'actions', label: 'Действия' },
];

const statusItems = [
  { id: 'pending', label: 'Ожидает' },
  { id: 'processing', label: 'В обработке' },
  { id: 'completed', label: 'Завершён' },
  { id: 'failed', label: 'Ошибка' },
  { id: 'refunded', label: 'Возврат' },
];

const statusLabel: Record<Order['status'], string> = {
  pending: 'Ожидает',
  processing: 'В обработке',
  completed: 'Завершён',
  failed: 'Ошибка',
  refunded: 'Возврат',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchOrders = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/orders?page=${pageNum}&limit=${ORDERS_PER_PAGE}`);
      if (!res.ok) {
        const msg = await parseApiError(res, 'Не удалось загрузить заказы');
        throw new Error(msg);
      }

      const data = await res.json();
      setOrders(data.orders || []);
      setPages(data.pagination?.pages ?? 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при загрузке заказов');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchOrders(page);
  }, [page, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const message = await parseApiError(res, 'Не удалось обновить статус');
        throw new Error(message);
      }

      const { order } = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? order : o)));
      toast.success('Статус заказа обновлён');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка обновления');
      console.error('Error updating order status:', error);
    }
  };

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-tertiary">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <TableCard.Root>
          <TableCard.Header
            title="Управление заказами"
            description="Просмотр и изменение статусов заказов"
            contentTrailing={
              <Button color="secondary" size="sm" href="/admin">
                В админ-панель
              </Button>
            }
          />

          <div className="border-b border-secondary px-4 py-4 md:px-6">
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'processing', 'completed', 'failed', 'refunded'] as const).map(
                (status) => (
                  <Button
                    key={status}
                    color={statusFilter === status ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === 'all' && 'Все'}
                    {status === 'pending' && 'Ожидает'}
                    {status === 'processing' && 'В обработке'}
                    {status === 'completed' && 'Завершены'}
                    {status === 'failed' && 'Ошибка'}
                    {status === 'refunded' && 'Возврат'}
                  </Button>
                )
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-tertiary">Заказы не найдены</div>
          ) : (
            <Table aria-label="Заказы" size="sm">
              <Table.Header columns={columns}>
                {(column) => <Table.Head id={column.id} label={column.label} />}
              </Table.Header>
              <Table.Body items={filteredOrders}>
                {(order) => (
                  <Table.Row id={order.id}>
                    <Table.Cell className="font-medium text-primary">{order.id}</Table.Cell>
                    <Table.Cell>
                      <div className="text-primary">{order.userEmail || '—'}</div>
                      <div className="text-xs text-quaternary">ID: {order.userId}</div>
                    </Table.Cell>
                    <Table.Cell>
                      <div>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</div>
                      {order.updatedAt && (
                        <div className="text-xs text-tertiary">
                          Обновлён:{' '}
                          {new Date(order.updatedAt).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell className="font-medium text-primary">{order.totalAmount} ₽</Table.Cell>
                    <Table.Cell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          order.status === 'completed'
                            ? 'bg-success-primary text-success-primary'
                            : order.status === 'processing'
                              ? 'bg-warning-primary text-warning-primary'
                              : order.status === 'pending'
                                ? 'bg-brand-primary text-brand-secondary'
                                : order.status === 'refunded'
                                  ? 'bg-secondary text-tertiary'
                                  : 'bg-error-primary text-error-primary'
                        }`}
                      >
                        {statusLabel[order.status]}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Select
                        selectedKey={order.status}
                        onSelectionChange={(key) => {
                          const newStatus = String(key);
                          if (newStatus === order.status) return;
                          const confirmed = window.confirm(
                            `Изменить статус заказа №${order.id} на «${statusLabel[newStatus as Order['status']] ?? newStatus}»?`
                          );
                          if (!confirmed) return;
                          updateOrderStatus(order.id, newStatus);
                        }}
                        items={statusItems}
                        size="sm"
                        aria-label={`Статус заказа ${order.id}`}
                      >
                        {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                      </Select>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          )}

          {!loading && filteredOrders.length > 0 && statusFilter === 'all' && (
            <div className="border-t border-secondary px-4 py-4">
              <PaginationPageDefault
                page={page}
                total={pages}
                className="mt-0"
                onPageChange={(nextPage) => {
                  setPage(nextPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </TableCard.Root>
      </div>
    </div>
  );
}
