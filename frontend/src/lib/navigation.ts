import {
  useNavigate,
  useLocation,
  useParams as useRouterParams,
  useSearchParams as useRRSearchParams,
} from 'react-router-dom';
import { useMemo } from 'react';

/** App navigate helpers (push/replace/back) over React Router. */
export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => navigate(0),
  };
}

export function usePathname(): string {
  return useLocation().pathname;
}

/** Read-only URLSearchParams for the current location. */
export function useSearchParams(): URLSearchParams {
  const [params] = useRRSearchParams();
  return useMemo(() => new URLSearchParams(params), [params]);
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return useRouterParams() as T;
}
