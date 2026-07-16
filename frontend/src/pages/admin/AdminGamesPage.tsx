import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Edit01, Trash01 } from '@untitledui/icons';
import { apiFetch } from '@/lib/api/client';
import { parseApiError } from '@/lib/api/errors';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Table, TableCard } from '@/components/application/table/table';
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal';

type Game = {
  id: string;
  slug: string;
  name: string;
  cover: string;
  genres: string[];
  platforms: string[];
  description?: string | null;
  popular: boolean;
};

const emptyForm = {
  slug: '',
  name: '',
  cover: '',
  genres: '',
  platforms: '',
  description: '',
  popular: false,
};

const columns = [
  { id: 'name', label: 'Название' },
  { id: 'slug', label: 'Slug' },
  { id: 'popular', label: 'Популярная' },
  { id: 'actions', label: 'Действия' },
];

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/games');
      if (!res.ok) throw new Error(await parseApiError(res, 'Не удалось загрузить игры'));
      const data = await res.json();
      setGames(data.games ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchGames();
  }, [fetchGames]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (game: Game) => {
    setEditingId(game.id);
    setForm({
      slug: game.slug,
      name: game.name,
      cover: game.cover,
      genres: (game.genres ?? []).join(', '),
      platforms: (game.platforms ?? []).join(', '),
      description: game.description ?? '',
      popular: game.popular,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      cover: form.cover.trim(),
      genres: form.genres.split(',').map((s) => s.trim()).filter(Boolean),
      platforms: form.platforms.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description.trim() || null,
      popular: form.popular,
    };
    try {
      const res = editingId
        ? await apiFetch(`/api/admin/games/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await apiFetch('/api/admin/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
      if (!res.ok) throw new Error(await parseApiError(res, 'Ошибка сохранения'));
      toast.success(editingId ? 'Игра обновлена' : 'Игра создана');
      setModalOpen(false);
      resetForm();
      await fetchGames();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить игру?')) return;
    try {
      const res = await apiFetch(`/api/admin/games/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await parseApiError(res, 'Ошибка удаления'));
      toast.success('Игра удалена');
      await fetchGames();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TableCard.Root>
        <TableCard.Header
          title="Игры"
          description="Управление каталогом игр"
          badge={games.length}
          contentTrailing={
            <div className="flex gap-2">
              <Button color="secondary" size="sm" href="/admin">
                Назад
              </Button>
              <Button color="primary" size="sm" iconLeading={Plus} onClick={openCreate}>
                Добавить
              </Button>
            </div>
          }
        />
        {loading ? (
          <div className="py-12 text-center text-tertiary">Загрузка...</div>
        ) : (
          <Table aria-label="Игры" size="sm">
            <Table.Header columns={columns}>
              {(column) => <Table.Head id={column.id} label={column.label} />}
            </Table.Header>
            <Table.Body items={games}>
              {(game) => (
                <Table.Row id={game.id}>
                  <Table.Cell>{game.name}</Table.Cell>
                  <Table.Cell>{game.slug}</Table.Cell>
                  <Table.Cell>{game.popular ? 'Да' : 'Нет'}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button color="secondary" size="sm" iconLeading={Edit01} onClick={() => openEdit(game)}>
                        Изменить
                      </Button>
                      <Button color="primary-destructive" size="sm" iconLeading={Trash01} onClick={() => handleDelete(game.id)}>
                        Удалить
                      </Button>
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
              <h2 className="text-lg font-semibold text-primary">{editingId ? 'Редактировать игру' : 'Новая игра'}</h2>
              <Input label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} isRequired />
              <Input label="Название" value={form.name} onChange={(v) => setForm({ ...form, name: v })} isRequired />
              <Input label="Обложка (URL)" value={form.cover} onChange={(v) => setForm({ ...form, cover: v })} isRequired />
              <Input label="Жанры" value={form.genres} onChange={(v) => setForm({ ...form, genres: v })} />
              <Input label="Платформы" value={form.platforms} onChange={(v) => setForm({ ...form, platforms: v })} />
              <Input label="Описание" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
              <Checkbox isSelected={form.popular} onChange={(v) => setForm({ ...form, popular: v })}>
                Популярная
              </Checkbox>
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
