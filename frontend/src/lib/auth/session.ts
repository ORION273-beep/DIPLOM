import { useAuthStore } from '@/lib/auth/store';

export function isAuthenticated(): boolean {
  const { user, accessToken } = useAuthStore.getState();
  return Boolean(user || accessToken);
}
