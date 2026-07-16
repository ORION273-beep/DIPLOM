import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from '@/lib/navigation';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/input/label';
import { NativeSelect } from '@/components/base/select/select-native';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Button } from '@/components/base/buttons/button';
import { cx } from '@/utils/cx';

type CategoryOption = { id: string; name: string };

type CatalogFiltersProps = {
  categories?: CategoryOption[];
  initial: {
    q: string;
    sort: string;
    category: string;
    platform: string;
    min: string;
    max: string;
    inStock: boolean;
    discount: boolean;
  };
};

export function CatalogFilters({ categories = [], initial }: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initial.q);
  const [sort, setSort] = useState(initial.sort);
  const [category, setCategory] = useState(initial.category);
  const [platform, setPlatform] = useState(initial.platform);
  const [min, setMin] = useState(initial.min);
  const [max, setMax] = useState(initial.max);
  const [inStock, setInStock] = useState(initial.inStock);
  const [discount, setDiscount] = useState(initial.discount);
  const initializedRef = useRef(false);

  const apply = (overrides?: Partial<Record<string, string | boolean>>) => {
    const next = new URLSearchParams(searchParams.toString());
    const values = {
      q,
      sort,
      category,
      platform,
      min,
      max,
      inStock,
      discount,
      ...overrides,
    };

    const setOrDelete = (key: string, value: string | boolean) => {
      if (typeof value === 'boolean') {
        if (value) next.set(key, '1');
        else next.delete(key);
        return;
      }
      const normalized = value.trim();
      if (normalized) next.set(key, normalized);
      else next.delete(key);
    };

    setOrDelete('q', String(values.q));
    setOrDelete('sort', String(values.sort));
    setOrDelete('category', String(values.category));
    setOrDelete('platform', String(values.platform));
    setOrDelete('min', String(values.min));
    setOrDelete('max', String(values.max));
    setOrDelete('inStock', Boolean(values.inStock));
    setOrDelete('discount', Boolean(values.discount));

    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    const timer = setTimeout(() => {
      apply();
    }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    if (!initializedRef.current) return;
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, category, platform, min, max, inStock, discount]);

  const reset = () => {
    setQ('');
    setSort('');
    setCategory('');
    setPlatform('');
    setMin('');
    setMax('');
    setInStock(false);
    setDiscount(false);
    router.push(pathname);
  };

  const chips = useMemo(() => {
    const sortLabels: Record<string, string> = {
      popular: 'Только популярные',
      price_asc: 'Цена: по возрастанию',
      price_desc: 'Цена: по убыванию',
    };
    const platformLabels: Record<string, string> = {
      mobile: 'Мобильные',
      pc: 'ПК',
    };
    const list: Array<{ key: string; label: string }> = [];
    if (q) list.push({ key: 'q', label: `Поиск: ${q}` });
    if (sort) list.push({ key: 'sort', label: `Сортировка: ${sortLabels[sort] ?? sort}` });
    if (category) list.push({ key: 'category', label: `Категория: ${category}` });
    if (platform) {
      list.push({ key: 'platform', label: `Платформа: ${platformLabels[platform] ?? platform}` });
    }
    if (min) list.push({ key: 'min', label: `Цена от: ${min}` });
    if (max) list.push({ key: 'max', label: `Цена до: ${max}` });
    if (inStock) list.push({ key: 'inStock', label: 'Только в наличии' });
    if (discount) list.push({ key: 'discount', label: 'Только со скидкой' });
    return list;
  }, [q, sort, category, platform, min, max, inStock, discount]);

  const removeChip = (key: string) => {
    if (key === 'q') setQ('');
    if (key === 'sort') setSort('');
    if (key === 'category') setCategory('');
    if (key === 'platform') setPlatform('');
    if (key === 'min') setMin('');
    if (key === 'max') setMax('');
    if (key === 'inStock') setInStock(false);
    if (key === 'discount') setDiscount(false);
    apply({ [key]: key === 'inStock' || key === 'discount' ? false : '' });
  };

  const categoryOptions = [
    { label: 'Любая', value: '' },
    ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
  ];

  const platformOptions = [
    { label: 'Любая', value: '' },
    { label: 'Мобильные', value: 'mobile' },
    { label: 'ПК', value: 'pc' },
  ];

  const sortOptions = [
    { label: 'По умолчанию', value: '' },
    { label: 'Только популярные', value: 'popular' },
    { label: 'Цена: по возрастанию', value: 'price_asc' },
    { label: 'Цена: по убыванию', value: 'price_desc' },
  ];

  return (
    <>
      <div className="mb-4 rounded-2xl border border-secondary bg-secondary p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Фильтры каталога</h3>
            <p className="text-xs text-tertiary">Изменения применяются автоматически</p>
          </div>
          <Button color="secondary" size="sm" onClick={reset}>
            Сбросить фильтры
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <Input
              label="Поиск"
              value={q}
              onChange={setQ}
              placeholder="Введите название товара"
              size="sm"
            />
          </div>

          <div className="md:col-span-2">
            <NativeSelect
              label="Категория"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
              size="sm"
            />
          </div>

          <div className="md:col-span-2">
            <NativeSelect
              label="Платформа"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={platformOptions}
              size="sm"
            />
          </div>

          <div className="md:col-span-4">
            <NativeSelect
              label="Сортировка"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={sortOptions}
              size="sm"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Цена от"
              value={min}
              onChange={setMin}
              placeholder="0"
              type="number"
              size="sm"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Цена до"
              value={max}
              onChange={setMax}
              placeholder="10000"
              type="number"
              size="sm"
            />
          </div>

          <div className="md:col-span-8">
            <Label className="mb-2">Дополнительно</Label>
            <div className="flex flex-wrap gap-4">
              <Checkbox
                label="Только в наличии"
                isSelected={inStock}
                onChange={setInStock}
                size="sm"
              />
              <Checkbox
                label="Только со скидкой"
                isSelected={discount}
                onChange={setDiscount}
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {chips.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => removeChip(f.key)}
              className="rounded-full border border-secondary bg-secondary px-3 py-1 text-xs text-secondary transition-colors hover:border-brand hover:text-brand-secondary"
            >
              {f.label} ×
            </button>
          ))}
          <button
            type="button"
            onClick={reset}
            className={cx(
              'rounded-full border border-brand/50 bg-brand-solid/10 px-3 py-1 text-xs text-brand-secondary',
              'hover:bg-brand-solid/20'
            )}
          >
            Сбросить все
          </button>
        </div>
      )}
    </>
  );
}
