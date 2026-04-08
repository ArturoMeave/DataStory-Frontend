import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeColors {
  accent: string;
  success: string;
  danger: string;
  warning: string;
}

interface ThemeState {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  updateColor: (key: keyof ThemeColors, value: string) => void;
  resetColors: () => void;
}

const defaultColors: ThemeColors = {
  accent: "#7c6aff",
  success: "#22d3a0",
  danger: "#f43f5e",
  warning: "#f59e0b",
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function applyColors(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty("--color-accent", colors.accent);
  root.style.setProperty(
    "--color-accent-dim",
    `rgba(${hexToRgb(colors.accent)},0.12)`,
  );
  root.style.setProperty("--color-accent-hover", colors.accent + "cc");
  root.style.setProperty("--color-success", colors.success);
  root.style.setProperty(
    "--color-success-dim",
    `rgba(${hexToRgb(colors.success)},0.10)`,
  );
  root.style.setProperty("--color-danger", colors.danger);
  root.style.setProperty(
    "--color-danger-dim",
    `rgba(${hexToRgb(colors.danger)},0.10)`,
  );
  root.style.setProperty("--color-warning", colors.warning);
  root.style.setProperty(
    "--color-warning-dim",
    `rgba(${hexToRgb(colors.warning)},0.10)`,
  );
}

function loadFromStorage(): { theme: Theme; colors: ThemeColors } {
  try {
    const theme = (localStorage.getItem("datastory_theme") as Theme) ?? "dark";
    const colorsRaw = localStorage.getItem("datastory_colors");
    const colors = colorsRaw ? JSON.parse(colorsRaw) : defaultColors;
    return { theme, colors };
  } catch {
    return { theme: "dark", colors: defaultColors };
  }
}

const initial = loadFromStorage();

// Aplicamos el tema y colores al arrancar
document.documentElement.setAttribute("data-theme", initial.theme);
applyColors(initial.colors);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initial.theme,
  colors: initial.colors,

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("datastory_theme", next);
      return { theme: next };
    }),

  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("datastory_theme", theme);
    set({ theme });
  },

  updateColor: (key, value) =>
    set((state) => {
      const colors = { ...state.colors, [key]: value };
      applyColors(colors);
      localStorage.setItem("datastory_colors", JSON.stringify(colors));
      return { colors };
    }),

  resetColors: () => {
    applyColors(defaultColors);
    localStorage.setItem("datastory_colors", JSON.stringify(defaultColors));
    set({ colors: defaultColors });
  },
}));
