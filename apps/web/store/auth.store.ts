// apps/web/store/auth.store.ts
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  organizationId: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  organization: Organization | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User, org: Organization | null) => void; // ← null-safe
  setAccessToken: (token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

const STORAGE_KEY = "sc_auth";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  organization: null,
  isAuthenticated: false,

  setAuth: (token, user, org) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user, org }));
    }
    set({
      accessToken: token,
      user,
      organization: org ?? null,
      isAuthenticated: true,
    });
  },

  setAccessToken: (token) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, token }));
      }
    }
    set({ accessToken: token });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({
      accessToken: null,
      user: null,
      organization: null,
      isAuthenticated: false,
    });
  },

  loadFromStorage: () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { token, user, org } = JSON.parse(stored);
          if (token && user) {
            set({
              accessToken: token,
              user,
              organization: org ?? null,
              isAuthenticated: true,
            });
          }
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  },
}));
