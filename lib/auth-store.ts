// Zustand store for authentication state management
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, Tenant, AuthState } from "./types";

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const { user, tenant, token } = await response.json();
            localStorage.setItem("auth-token", token);
            console.log("lib/auth-store.ts: Token set in localStorage after login:", token); // Log token set
            set({
              user: { ...user, _id: user._id.toString(), id: user._id.toString() },
              tenant: { ...tenant, _id: tenant._id.toString(), id: tenant._id.toString() },
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
        } catch (error) {
          console.error("Login error:", error);
        }

        set({ isLoading: false });
        return false;
      },

      logout: () => {
        localStorage.removeItem("auth-token");
        console.log("lib/auth-store.ts: Token removed from localStorage."); // Log token removal
        set({
          user: null,
          tenant: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setToken: (token: string | null) => {
        set({ token });
        if (token) {
          localStorage.setItem("auth-token", token);
          console.log("lib/auth-store.ts: Token explicitly set via setToken:", token); // Log token set
        } else {
          localStorage.removeItem("auth-token");
          console.log("lib/auth-store.ts: Token explicitly removed via setToken."); // Log token removal
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });

        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          });

          if (response.ok) {
            const { user, tenant, token } = await response.json();
            localStorage.setItem("auth-token", token);
            console.log("lib/auth-store.ts: Token set in localStorage after registration:", token); // Log token set
            set({
              user: { ...user, _id: user._id.toString(), id: user._id.toString() },
              tenant: { ...tenant, _id: tenant._id.toString(), id: tenant._id.toString() },
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return true;
          }
        } catch (error) {
          console.error("Registration error:", error);
        }

        set({ isLoading: false });
        return false;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
