'use client';

import { usePathname, useSearchParams } from 'next/navigation';

/** Current pathname + query string for post-login return. */
export function useReturnPath(): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}
