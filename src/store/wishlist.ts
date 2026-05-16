import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistState = {
  items: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (id: string) => {
        const current = get().items;
        if (current.includes(id)) {
          set({ items: current.filter((i) => i !== id) });
        } else {
          set({ items: [...current, id] });
        }
      },

      has: (id: string) => get().items.includes(id)
    }),
    {
      name: "silvio-wishlist",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
