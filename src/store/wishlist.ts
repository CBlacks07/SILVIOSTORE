import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WishlistState = {
  items: string[];
  _hydrated: boolean;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  sync: (validIds: string[]) => void;
  setHydrated: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      _hydrated: false,

      toggle: (id: string) => {
        const current = get().items;
        if (current.includes(id)) {
          set({ items: current.filter((i) => i !== id) });
        } else {
          set({ items: [...current, id] });
        }
      },

      has: (id: string) => get().items.includes(id),

      sync: (validIds: string[]) => {
        const current = get().items;
        const cleaned = current.filter((id) => validIds.includes(id));
        if (cleaned.length !== current.length) set({ items: cleaned });
      },

      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: "silvio-wishlist",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
