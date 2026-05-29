"use client";

import { create } from "zustand";

type ProductColorState = {
  productId: string;
  label: string;
  image: string | null;
  setColor: (productId: string, label: string, image?: string | null) => void;
  reset: () => void;
};

export const useProductColor = create<ProductColorState>((set) => ({
  productId: "",
  label: "",
  image: null,
  setColor: (productId, label, image = null) => set({ productId, label, image }),
  reset: () => set({ productId: "", label: "", image: null }),
}));
