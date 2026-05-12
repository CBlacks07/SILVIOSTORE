"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const overlay = (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          zIndex: 9001,
          width: "min(320px, 90vw)",
          background: "#fff",
          boxShadow: "4px 0 32px rgba(0,0,0,0.18)",
          overflowY: "auto",
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

  return (
    <>
      {/* Trigger — mobile only */}
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

      {mounted && createPortal(overlay, document.body)}
    </>
  );
}
