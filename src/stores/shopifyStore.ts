import { create } from "zustand";

interface ShopifyState {
  isConnected: boolean;
  shopName: string | null;
  setConnection: (status: boolean, name: string | null) => void;
}

export const useShopifyStore = create<ShopifyState>((set) => ({
  isConnected: false,
  shopName: null,
  setConnection: (status, name) => set({ isConnected: status, shopName: name }),
}));
