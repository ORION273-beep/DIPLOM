'use client';

import { useRouter } from '@/lib/navigation';
import { PaginationPageDefault } from '@/components/application/pagination/pagination';

type CatalogPaginationProps = {
  page: number;
  pages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
};

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function CatalogPagination({ page, pages, basePath, searchParams }: CatalogPaginationProps) {
  const router = useRouter();

  if (pages <= 1) return null;

  return (
    <PaginationPageDefault
      page={page}
      total={pages}
      className="mt-8"
      onPageChange={(nextPage) => {
        router.push(buildHref(basePath, searchParams, nextPage));
      }}
    />
  );
}
