import { create } from "zustand";
import type { AuthState, AuthUser } from "../types";

interface AuthActions {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void; // <-- 1. NUESTRO NUEVO "BOLÍGRAFO"
}

function getInitialState(): AuthState {
  try {
    const token = localStorage.getItem("datastory_token");
    const userRaw = localStorage.getItem("datastory_user");

    if (token && userRaw) {
      const user = JSON.parse(userRaw) as AuthUser;
      return { token, user, isAuthenticated: true };
    }
  } catch {
    localStorage.removeItem("datastory_token");
    localStorage.removeItem("datastory_user");
  }

  return { token: null, user: null, isAuthenticated: false };
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...getInitialState(),

  login: (token, user) => {
    localStorage.setItem("datastory_token", token);
    localStorage.setItem("datastory_user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("datastory_token");
    localStorage.removeItem("datastory_user");
    set({ token: null, user: null, isAuthenticated: false });
  },

  // 2. LA MAGIA: Actualiza el estado y el disco duro al mismo tiempo
  updateUser: (updates) =>
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates };
      localStorage.setItem("datastory_user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    }),
}));
