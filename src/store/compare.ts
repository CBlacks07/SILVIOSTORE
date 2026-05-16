import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type CompareState = {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        if (get().ids.length >= 3) return;
        if (!get().ids.includes(id)) set({ ids: [...get().ids, id] });
      },
      remove: (id) => set({ ids: get().ids.filter((i) => i !== id) }),
      toggle: (id) => get().ids.includes(id) ? get().remove(id) : get().add(id),
      has: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: "silvio-compare", storage: createJSONStorage(() => localStorage) }
  )
);
