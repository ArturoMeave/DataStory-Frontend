import { create } from "zustand";

interface ShopifyState {
  isConnected: boolean;
  shopName: string | null;
  setConnection: (status: boolean, name?: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const useShopifyStore = create<ShopifyState>((set) => ({
  isConnected: false,
  shopName: null,
  setConnection: (status, name) =>
    set({ isConnected: status, shopName: name || null }),
  activeView: "overview",
  setActiveView: (view) => set({ activeView: view }),
}));
