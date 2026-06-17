'use client';

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

type Product = {
  id: string;
  title: string;
  category: string;
  platform: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  stock: number;
  inStock: boolean;
  popular: boolean;
  gameSlug?: string | null;
};

const emptyForm = {
  title: '',
  category: 'currency',
  platform: 'mobile',
  price: '',
  oldPrice: '',
  image: '',
  stock: '100',
  popular: false,
  gameSlug: '',
};

const columns = [
  { id: 'title', label: 'Название' },
  { id: 'price', label: 'Цена' },
  { id: 'stock', label: 'Остаток' },
  { id: 'actions', label: 'Действия' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/products');
      if (!res.ok) {
        throw new Error(await parseApiError(res, 'Не удалось загрузить товары'));
      }
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      category: product.category,
      platform: product.platform,
      price: String(product.price),
      oldPrice: product.oldPrice != null ? String(product.oldPrice) : '',
      image: product.image,
      stock: String(product.stock),
      popular: product.popular,
      gameSlug: product.gameSlug ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        platform: form.platform,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        image: form.image,
        stock: Number(form.stock),
        popular: form.popular,
        gameSlug: form.gameSlug || null,
      };

      const res = editingId
        ? await apiFetch(`/api/admin/products/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await apiFetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        throw new Error(await parseApiError(res, 'Не удалось сохранить товар'));
      }

      toast.success(editingId ? 'Товар обновлён' : 'Товар создан');
      resetForm();
      setModalOpen(false);
      await fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка сохранения');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return;
    try {
      const res = await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(await parseApiError(res, 'Не удалось удалить товар'));
      }
      toast.success('Товар удалён');
      if (editingId === id) {
        resetForm();
        setModalOpen(false);
      }
      await fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка удаления');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TableCard.Root>
        <TableCard.Header
          title="Управление товарами"
          description={`${products.length} позиций в каталоге`}
          badge={products.length}
          contentTrailing={
            <div className="flex gap-2">
              <Button color="secondary" size="sm" href="/admin">
                Назад
              </Button>
              <Button color="primary" size="sm" onClick={openCreate} iconLeading={Plus}>
                Создать товар
              </Button>
            </div>
          }
        />

        {loading ? (
          <div className="py-12 text-center text-tertiary">Загрузка...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-tertiary">Товаров пока нет</div>
        ) : (
          <Table aria-label="Товары" size="sm">
            <Table.Header columns={columns}>
              {(column) => <Table.Head id={column.id} label={column.label} />}
            </Table.Header>
            <Table.Body items={products}>
              {(product) => (
                <Table.Row id={product.id}>
                  <Table.Cell>
                    <div className="font-medium text-primary">{product.title}</div>
                    <div className="text-xs text-quaternary">
                      {product.category} · {product.platform}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-brand-secondary">{product.price} ₽</Table.Cell>
                  <Table.Cell>{product.stock}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Button color="secondary" size="sm" onClick={() => handleEdit(product)} iconLeading={Edit01}>
                        Изменить
                      </Button>
                      <Button color="primary-destructive" size="sm" onClick={() => handleDelete(product.id)} iconLeading={Trash01}>
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
            <h2 className="mb-1 text-lg font-semibold text-primary">
              {editingId ? 'Редактировать товар' : 'Новый товар'}
            </h2>
            <p className="mb-6 text-sm text-tertiary">Заполните поля и сохраните</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Название"
                value={form.title}
                onChange={(v) => setForm({ ...form, title: v })}
                isRequired
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Категория"
                  value={form.category}
                  onChange={(v) => setForm({ ...form, category: v })}
                  isRequired
                />
                <Input
                  label="Платформа"
                  value={form.platform}
                  onChange={(v) => setForm({ ...form, platform: v })}
                  isRequired
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Цена"
                  type="number"
                  value={form.price}
                  onChange={(v) => setForm({ ...form, price: v })}
                  isRequired
                />
                <Input
                  label="Старая цена"
                  type="number"
                  value={form.oldPrice}
                  onChange={(v) => setForm({ ...form, oldPrice: v })}
                />
              </div>
              <Input
                label="URL изображения"
                value={form.image}
                onChange={(v) => setForm({ ...form, image: v })}
                isRequired
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Остаток"
                  type="number"
                  value={form.stock}
                  onChange={(v) => setForm({ ...form, stock: v })}
                  isRequired
                />
                <Input
                  label="gameSlug"
                  value={form.gameSlug}
                  onChange={(v) => setForm({ ...form, gameSlug: v })}
                />
              </div>
              <Checkbox
                label="Популярный товар"
                isSelected={form.popular}
                onChange={(v) => setForm({ ...form, popular: v })}
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" color="primary" isDisabled={submitting}>
                  {submitting ? 'Сохранение...' : editingId ? 'Обновить' : 'Создать'}
                </Button>
                <Button type="button" color="secondary" slot="close">
                  Отмена
                </Button>
              </div>
            </form>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
}
