import { create } from "zustand";
import type { AuthState, AuthUser } from "../types";

interface AuthActions {
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

// Recuperamos el token y usuario del localStorage al arrancar la app.
// Así si el usuario recarga la página no pierde la sesión.
function getInitialState(): AuthState {
  try {
    const token = localStorage.getItem("datastory_token");
    const userRaw = localStorage.getItem("datastory_user");

    if (token && userRaw) {
      const user = JSON.parse(userRaw) as AuthUser;
      return { token, user, isAuthenticated: true };
    }
  } catch {
    // Si hay algún error leyendo el localStorage limpiamos todo
    localStorage.removeItem("datastory_token");
    localStorage.removeItem("datastory_user");
  }

  return { token: null, user: null, isAuthenticated: false };
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...getInitialState(),

  login: (token, user) => {
    // Guardamos en localStorage para que persista al recargar
    localStorage.setItem("datastory_token", token);
    localStorage.setItem("datastory_user", JSON.stringify(user));

    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    // Limpiamos localStorage y el estado
    localStorage.removeItem("datastory_token");
    localStorage.removeItem("datastory_user");

    set({ token: null, user: null, isAuthenticated: false });
  },
}));
