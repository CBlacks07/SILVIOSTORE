"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CatalogueSidebar } from "./CatalogueSidebar";
import type { Brand, Category } from "@/lib/types";

type Props = {
  categories: Pick<Category, "slug" | "name">[];
  brands: Pick<Brand, "id" | "name">[];
  activeCategory: string;
  activeBrand: string;
  q: string;
  prixMin: string;
  prixMax: string;
  resultCount: number;
};

export function MobileFilterDrawer(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger button — visible only on mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center gap-2 rounded border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm"
      >
        <SlidersHorizontal className="h-4 w-4 text-accent" />
        Filtres
        {(props.activeCategory || props.activeBrand || props.prixMin || props.prixMax) && (
          <span className="ml-1 h-5 w-5 rounded-full bg-accent text-white text-[10px] font-black flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed inset-y-0 left-0 z-[301] w-80 max-w-[90vw] bg-white shadow-2xl lg:hidden overflow-y-auto"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
          <p className="font-semibold text-brand-950">Filtres</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 text-brand-400 hover:text-brand-900 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <CatalogueSidebar {...props} />
        </div>
      </div>
    </>
  );
}
