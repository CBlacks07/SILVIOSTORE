"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  owner: string;
  isOpen: boolean;
  setOwner: (owner: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantLabel: string) => void;
  updateQuantity: (productId: string, quantity: number, variantLabel: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
  totalItems: () => number;
  subtotal: () => number;
};

const sameLine = (a: CartItem, b: CartItem) =>
  a.productId === b.productId && (a.variantLabel || "") === (b.variantLabel || "");

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      owner: "guest",
      isOpen: false,

      setOwner: (owner) => {
        if (owner === get().owner) return;
        set({ owner, items: [], isOpen: false });
      },

      addItem: (item) => {
        const items = [...get().items];
        const existing = items.findIndex((i) => sameLine(i, item));
        if (existing >= 0) {
          items[existing] = { ...items[existing], quantity: items[existing].quantity + item.quantity };
        } else {
          items.push(item);
        }
        set({ items, isOpen: true });
      },

      removeItem: (productId, variantLabel) =>
        set({
          items: get().items.filter(
            (i) => !(i.productId === productId && (i.variantLabel || "") === (variantLabel || ""))
          )
        }),

      updateQuantity: (productId, quantity, variantLabel) =>
        set({
          items: get()
            .items.map((i) =>
              i.productId === productId && (i.variantLabel || "") === (variantLabel || "")
                ? { ...i, quantity: Math.max(1, quantity) }
                : i
            )
        }),

      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    }),
    {
      name: "silvio-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, owner: state.owner })
    }
  )
);
