import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit01, Trash01 } from '@untitledui/icons';
import { apiFetch } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Table, TableCard } from '@/components/application/table/table';
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal';

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sort: number;
};

const emptyForm = { question: '', answer: '', sort: '0' };

const columns = [
  { id: 'question', label: 'Вопрос' },
  { id: 'sort', label: 'Порядок' },
  { id: 'actions', label: 'Действия' },
];

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/faq');
      if (!res.ok) throw new Error(await parseApiError(res, 'Не удалось загрузить FAQ'));
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      sort: Number(form.sort) || 0,
    };
    try {
      const res = editingId
        ? await apiFetch(`/api/admin/faq/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await apiFetch('/api/admin/faq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error(await parseApiError(res, 'Ошибка сохранения'));
      toast.success('Сохранено');
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить вопрос?')) return;
    const res = await apiFetch(`/api/admin/faq/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Удалено');
      await fetchItems();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TableCard.Root>
        <TableCard.Header
          title="FAQ"
          badge={items.length}
          contentTrailing={
            <div className="flex gap-2">
              <Button href="/admin" color="secondary" size="sm">
                Назад
              </Button>
              <Button
                color="primary"
                size="sm"
                iconLeading={Plus}
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setModalOpen(true);
                }}
              >
                Добавить
              </Button>
            </div>
          }
        />
        {loading ? (
          <div className="py-12 text-center text-tertiary">Загрузка...</div>
        ) : (
          <Table aria-label="FAQ" size="sm">
            <Table.Header columns={columns}>
              {(column) => <Table.Head id={column.id} label={column.label} />}
            </Table.Header>
            <Table.Body items={items}>
              {(item) => (
                <Table.Row id={item.id}>
                  <Table.Cell>{item.question}</Table.Cell>
                  <Table.Cell>{item.sort}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button
                        color="secondary"
                        size="sm"
                        iconLeading={Edit01}
                        onClick={() => {
                          setEditingId(item.id);
                          setForm({
                            question: item.question,
                            answer: item.answer,
                            sort: String(item.sort),
                          });
                          setModalOpen(true);
                        }}
                      />
                      <Button color="primary-destructive" size="sm" iconLeading={Trash01} onClick={() => handleDelete(item.id)} />
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </TableCard.Root>

      <ModalOverlay isOpen={modalOpen} onOpenChange={setModalOpen}>
        <Modal className="w-full max-w-lg">
          <Dialog className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-primary">{editingId ? 'Редактировать' : 'Новый вопрос'}</h2>
              <Input label="Вопрос" value={form.question} onChange={(v) => setForm({ ...form, question: v })} isRequired />
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Ответ</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  required
                  className="w-full rounded-lg border border-secondary bg-primary px-3 py-2 text-sm text-primary"
                />
              </div>
              <Input label="Порядок" value={form.sort} onChange={(v) => setForm({ ...form, sort: v })} />
              <div className="flex justify-end gap-2">
                <Button type="button" color="secondary" slot="close">
                  Отмена
                </Button>
                <Button type="submit" color="primary" isDisabled={submitting}>
                  Сохранить
                </Button>
              </div>
            </form>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
