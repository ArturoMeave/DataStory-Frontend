import { create } from "zustand";
import { persist } from "zustand/middleware"; // 1. Importamos el "pegamento" de memoria

interface ShopifyState {
  isConnected: boolean;
  isSkipped: boolean;
  storeName: string | null;
  activeView: string;
  setConnection: (status: boolean, name?: string) => void;
  setIsSkipped: (skipped: boolean) => void;
  setActiveView: (view: string) => void;
}

export const useShopifyStore = create<ShopifyState>()(
  persist(
    (set) => ({
      isConnected: false,
      isSkipped: false,
      storeName: null,
      activeView: "overview",
      setConnection: (status, name) =>
        set({ isConnected: status, storeName: name || null }),
      setIsSkipped: (skipped) => set({ isSkipped: skipped }),
      setActiveView: (view) => set({ activeView: view }),
    }),
    {
      name: "shopify-storage",
    },
  ),
);
