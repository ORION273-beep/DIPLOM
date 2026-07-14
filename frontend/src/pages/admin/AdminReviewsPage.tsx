'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Trash01, Check } from '@untitledui/icons';
import { apiFetch } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';
import { Button } from '@/components/base/buttons/button';
import { Table, TableCard } from '@/components/application/table/table';

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  published: boolean;
  createdAt: string;
};

const columns = [
  { id: 'author', label: 'Автор' },
  { id: 'rating', label: 'Оценка' },
  { id: 'published', label: 'Статус' },
  { id: 'actions', label: 'Действия' },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/reviews');
      if (!res.ok) throw new Error(await parseApiError(res, 'Ошибка загрузки'));
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchReviews();
  }, [fetchReviews]);

  const togglePublish = async (id: string, published: boolean) => {
    const res = await apiFetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published }),
    });
    if (res.ok) {
      toast.success(published ? 'Опубликовано' : 'Скрыто');
      await fetchReviews();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return;
    const res = await apiFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Удалено');
      await fetchReviews();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TableCard.Root>
        <TableCard.Header
          title="Модерация отзывов"
          badge={reviews.length}
          contentTrailing={
            <Button href="/admin" color="secondary" size="sm">
              Назад
            </Button>
          }
        />
        {loading ? (
          <div className="py-12 text-center text-tertiary">Загрузка...</div>
        ) : (
          <Table aria-label="Отзывы" size="sm">
            <Table.Header columns={columns}>
              {(column) => <Table.Head id={column.id} label={column.label} />}
            </Table.Header>
            <Table.Body items={reviews}>
              {(review) => (
                <Table.Row id={review.id}>
                  <Table.Cell>
                    <div className="font-medium text-primary">{review.author}</div>
                    <div className="max-w-md truncate text-xs text-tertiary">{review.text}</div>
                  </Table.Cell>
                  <Table.Cell>{'★'.repeat(review.rating)}</Table.Cell>
                  <Table.Cell>{review.published ? 'Опубликован' : 'На модерации'}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      {!review.published && (
                        <Button color="secondary" size="sm" iconLeading={Check} onClick={() => togglePublish(review.id, true)}>
                          Опубликовать
                        </Button>
                      )}
                      <Button color="primary-destructive" size="sm" iconLeading={Trash01} onClick={() => handleDelete(review.id)} />
                    </div>
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
