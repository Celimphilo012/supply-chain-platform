import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  organizationId: string;
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
  setAuth: (token: string, user: User, org: Organization) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  organization: null,
  isAuthenticated: false,
  setAuth: (token, user, org) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "auth-storage",
        JSON.stringify({ token, user, org }),
      );
    }
    set({ accessToken: token, user, organization: org, isAuthenticated: true });
  },
  setAccessToken: (token) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem(
          "auth-storage",
          JSON.stringify({ ...parsed, token }),
        );
      }
    }
    set({ accessToken: token });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
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
      const stored = localStorage.getItem("auth-storage");
      if (stored) {
        const { token, user, org } = JSON.parse(stored);
        set({
          accessToken: token,
          user,
          organization: org,
          isAuthenticated: true,
        });
      }
    }
  },
}));
