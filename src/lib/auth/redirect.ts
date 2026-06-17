const DEFAULT_AFTER_LOGIN = '/';

const AUTH_PATHS = new Set(['/login', '/register', '/forgot-password', '/reset-password']);

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
export function buildLoginUrl(returnPath?: string | null): string {
  const safe = sanitizeReturnPath(returnPath);
  if (safe === DEFAULT_AFTER_LOGIN) return '/login';
  return `/login?next=${encodeURIComponent(safe)}`;
}

export function getPostLoginPath(nextParam: string | null): string {
  return sanitizeReturnPath(nextParam);
}
