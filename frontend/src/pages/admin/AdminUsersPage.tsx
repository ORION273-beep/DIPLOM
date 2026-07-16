import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Table, TableCard } from '@/components/application/table/table';

type AdminUser = {
  id: string;
  email: string;
  role: string;
  balance: number;
  blocked: boolean;
  orderCount: number;
  createdAt: string;
};

const columns = [
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Роль' },
  { id: 'balance', label: 'Баланс' },
  { id: 'orders', label: 'Заказов' },
  { id: 'actions', label: 'Действия' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [balanceEdit, setBalanceEdit] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/users');
      if (!res.ok) throw new Error(await parseApiError(res, 'Ошибка загрузки'));
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (id: string, body: Record<string, unknown>) => {
    const res = await apiFetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.error(await parseApiError(res, 'Ошибка обновления'));
      return;
    }
    toast.success('Обновлено');
    setEditingId(null);
    await fetchUsers();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TableCard.Root>
        <TableCard.Header
          title="Пользователи"
          badge={users.length}
          contentTrailing={
            <Button href="/admin" color="secondary" size="sm">
              Назад
            </Button>
          }
        />
        {loading ? (
          <div className="py-12 text-center text-tertiary">Загрузка...</div>
        ) : (
          <Table aria-label="Пользователи" size="sm">
            <Table.Header columns={columns}>
              {(column) => <Table.Head id={column.id} label={column.label} />}
            </Table.Header>
            <Table.Body items={users}>
              {(u) => (
                <Table.Row id={u.id}>
                  <Table.Cell>{u.email}</Table.Cell>
                  <Table.Cell>
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                      className="rounded border border-secondary bg-primary px-2 py-1 text-sm"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </Table.Cell>
                  <Table.Cell>
                    {editingId === u.id ? (
                      <div className="flex items-center gap-2">
                        <Input value={balanceEdit} onChange={setBalanceEdit} size="sm" />
                        <Button size="sm" color="primary" onClick={() => updateUser(u.id, { balance: Number(balanceEdit) })}>
                          OK
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-brand-secondary hover:underline"
                        onClick={() => {
                          setEditingId(u.id);
                          setBalanceEdit(String(u.balance));
                        }}
                      >
                        {u.balance.toLocaleString('ru-RU')} ₽
                      </button>
                    )}
                  </Table.Cell>
                  <Table.Cell>{u.orderCount}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="sm"
                      color={u.blocked ? 'primary' : 'secondary'}
                      onClick={() => updateUser(u.id, { blocked: !u.blocked })}
                    >
                      {u.blocked ? 'Разблокировать' : 'Заблокировать'}
                    </Button>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>
    </div>
  );
}
