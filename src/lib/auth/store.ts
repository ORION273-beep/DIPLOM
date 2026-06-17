import { create } from 'zustand';
import { clearStoredSession, loadStoredSession, saveStoredSession } from './sessionStorage';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  balance?: number;
  createdAt?: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  authReady: boolean;
  setSession: (user: AuthUser, accessToken: string) => void;
  clear: () => void;
  setAuthReady: (ready: boolean) => void;
  hydrateFromStorage: () => void;
};

const stored = typeof window !== 'undefined' ? loadStoredSession() : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: stored?.user ?? null,
  accessToken: stored?.accessToken ?? null,
  authReady: false,
  setSession: (user, accessToken) => {
    saveStoredSession(user, accessToken);
    set({ user, accessToken, authReady: true });
  },
  clear: () => {
    clearStoredSession();
    set({ user: null, accessToken: null, authReady: true });
  },
  setAuthReady: (ready) => set({ authReady: ready }),
  hydrateFromStorage: () => {
    const session = loadStoredSession();
    if (session) {
      set({ user: session.user, accessToken: session.accessToken });
    }
  },
}));
