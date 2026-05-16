import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CompareItem = { id: string; name: string };

type CompareState = {
  items: CompareItem[];
  add: (item: CompareItem) => void;
  remove: (id: string) => void;
  toggle: (item: CompareItem) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) => {
        if (get().items.length >= 3) return;
        if (!get().items.find(i => i.id === item.id))
          set({ items: [...get().items, item] });
      },
      remove: (id) => set({ items: get().items.filter(i => i.id !== id) }),
      toggle: (item) =>
        get().items.find(i => i.id === item.id)
          ? get().remove(item.id)
          : get().add(item),
      has: (id) => !!get().items.find(i => i.id === id),
      clear: () => set({ items: [] }),
    }),
    { name: "silvio-compare", storage: createJSONStorage(() => localStorage) }
  )
);
