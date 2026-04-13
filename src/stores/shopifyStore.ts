import { create } from "zustand";

// Definimos qué cosas puede recordar nuestro cerebro de Shopify
interface ShopifyState {
  activeView: string; // Ejemplo: 'overview', 'products', etc.
  setActiveView: (view: string) => void;
}

export const useShopifyStore = create<ShopifyState>((set) => ({
  activeView: "overview", // Empezamos siempre viendo el resumen
  setActiveView: (view) => set({ activeView: view }),
}));
