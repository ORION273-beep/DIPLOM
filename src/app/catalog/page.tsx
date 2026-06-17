import { ProductCard } from '@/components/commerce/ProductCard';
import { CatalogPagination } from '@/components/catalog/CatalogPagination';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';
import { fetchCategories, fetchProducts } from '@/lib/api/products';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    q?: string;
    category?: string;
    platform?: string;
    min?: string;
    max?: string;
    inStock?: string;
    discount?: string;
    page?: string;
  }>;
}) {
  const filters = await searchParams;
  const { sort, q, category, platform, min, max, inStock, discount, page } = filters;
  const onlyInStock = inStock === '1';
  const onlyDiscount = discount === '1';
  const currentPage = page || '1';

  const [{ products, pagination, error }, { categories }] = await Promise.all([
    fetchProducts({ ...filters, page: currentPage, limit: '12' }),
    fetchCategories(),
  ]);

  const filterParams = {
    sort,
    q,
    category,
    platform,
    min,
    max,
    inStock: onlyInStock ? '1' : undefined,
    discount: onlyDiscount ? '1' : undefined,
  };

  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Catalog"
        title="Каталог товаров"
        description={sort === 'popular' ? 'Популярные предложения' : 'Полный каталог OneSec'}
      />

      <div className="container mx-auto px-4 pb-10">
        <div className="mb-4 flex justify-end text-sm text-quaternary">
          {pagination?.total ?? products.length} позиций
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={category === cat.id ? '/catalog' : `/catalog?category=${cat.id}`}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                category === cat.id
                  ? 'border-brand bg-brand-solid/15 text-brand-secondary'
                  : 'border-secondary bg-secondary text-secondary hover:border-brand hover:text-brand-secondary'
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>

        <CatalogFilters
          categories={categories}
          initial={{
            q: q ?? '',
            sort: sort ?? '',
            category: category ?? '',
            platform: platform ?? '',
            min: min ?? '',
            max: max ?? '',
            inStock: onlyInStock,
            discount: onlyDiscount,
          }}
        />

        {error ? (
          <div className="rounded-2xl border border-red-800/50 bg-red-900/20 p-10 text-center text-red-200">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-secondary bg-secondary p-10 text-center text-tertiary">
            Товары по выбранным фильтрам не найдены.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {pagination && (
              <CatalogPagination
                page={pagination.page}
                pages={pagination.pages}
                basePath="/catalog"
                searchParams={filterParams}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
