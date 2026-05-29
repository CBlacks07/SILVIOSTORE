"use client";

import { create } from "zustand";

type ProductColorState = {
  productId: string;
  label: string;
  setColor: (productId: string, label: string) => void;
  reset: () => void;
};

export const useProductColor = create<ProductColorState>((set) => ({
  productId: "",
  label: "",
  setColor: (productId, label) => set({ productId, label }),
  reset: () => set({ productId: "", label: "" }),
}));
