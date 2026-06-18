const DEFAULT_AFTER_LOGIN = '/';

const AUTH_PATHS = new Set(['/login', '/register', '/forgot-password', '/reset-password']);

export type LoginReason = 'cart' | 'favorites';

export const LOGIN_REASON_MESSAGES: Record<LoginReason, string> = {
  cart: 'Войдите в аккаунт, чтобы добавлять товары в корзину',
  favorites: 'Войдите в аккаунт, чтобы добавлять товары в избранное',
};

const VALID_REASONS = new Set<string>(Object.keys(LOGIN_REASON_MESSAGES));

export function parseLoginReason(value: string | null | undefined): LoginReason | null {
  if (!value || !VALID_REASONS.has(value)) return null;
  return value as LoginReason;
}

function isAuthPath(path: string): boolean {
  const pathname = path.split('?')[0] ?? path;
  return AUTH_PATHS.has(pathname);
}

/** Safe internal return path after login. Defaults to home. */
export function sanitizeReturnPath(path: string | null | undefined): string {
  if (!path) return DEFAULT_AFTER_LOGIN;
  if (!path.startsWith('/') || path.startsWith('//')) return DEFAULT_AFTER_LOGIN;
  if (isAuthPath(path)) return DEFAULT_AFTER_LOGIN;
  return path;
}

/** Build /login URL; omit ?next when return path is home (voluntary login). */
export function buildLoginUrl(returnPath?: string | null, reason?: LoginReason | null): string {
  const safe = sanitizeReturnPath(returnPath);
  const params = new URLSearchParams();

  if (safe !== DEFAULT_AFTER_LOGIN) {
    params.set('next', safe);
  }
  if (reason) {
    params.set('reason', reason);
  }

  const query = params.toString();
  return query ? `/login?${query}` : '/login';
}

export function getPostLoginPath(nextParam: string | null): string {
  return sanitizeReturnPath(nextParam);
}
