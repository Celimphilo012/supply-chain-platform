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
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  organization: null,
  isAuthenticated: false,
  setAuth: (token, user, org) =>
    set({ accessToken: token, user, organization: org, isAuthenticated: true }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () =>
    set({
      accessToken: null,
      user: null,
      organization: null,
      isAuthenticated: false,
    }),
}));
