"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "./hooks/useSearch";
import { formatPrice } from "@/lib/utils";

export function HeaderSearch() {
  const { q, setQ, suggestions, searchFocused, setSearchFocused } = useSearch();

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Search Input — flex layout, no absolute icon */}
        <form
          action="/catalogue"
          method="GET"
          className="flex items-center h-11 rounded-full bg-white ring-2 ring-white focus-within:ring-brand-500 transition-all duration-200"
        >
          <span className="flex items-center pl-4 pr-2 text-brand-400 group-focus-within:text-brand-600 transition-colors shrink-0">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            onKeyDown={(e) => { if (e.key === "Escape") { setSearchFocused(false); setQ(""); } }}
            placeholder="Rechercher un produit..."
            className="flex-1 min-w-0 bg-transparent border-0 h-full py-0 text-sm text-brand-950 placeholder-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            style={{ backgroundColor: '#a3752c', color: '#ffffff' }}
            className="search-btn h-full px-5 text-[10px] font-black uppercase tracking-widest rounded-r-full transition-colors shrink-0"
          >
            Rechercher
          </button>
        </form>

        {/* Suggestions Dropdown - Premium */}
        <AnimatePresence>
          {searchFocused &&
            (suggestions.products.length > 0 ||
              suggestions.categories.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl border-0 overflow-hidden z-50 p-4"
              >
                {/* Categories Section */}
                {suggestions.categories.length > 0 && (
                  <div className="pb-4">
                    <p className="text-[9px] font-bold text-brand-400 uppercase tracking-widest px-2 mb-3">
                      Catégories
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/catalogue?categorie=${c.slug}`}
                          className="px-3 py-2 bg-brand-50 hover:bg-accent hover:text-white rounded-lg text-xs text-brand-700 font-medium transition-all duration-200"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Section */}
                {suggestions.products.length > 0 && (
                  <div className={suggestions.categories.length > 0 ? "border-t border-brand-100 pt-4" : ""}>
                    <p className="text-[9px] font-bold text-brand-400 uppercase tracking-widest px-2 mb-3">
                      Produits
                    </p>
                    <div className="space-y-1">
                      {suggestions.products.slice(0, 5).map((p) => {
                        const cover = p.images?.[0];
                        return (
                          <Link
                            key={p.slug}
                            href={`/produit/${p.slug}`}
                            className="flex items-center gap-3 p-2 hover:bg-brand-50 rounded-lg transition-colors duration-150"
                          >
                            <div className="h-11 w-11 bg-brand-100 rounded-lg shrink-0 overflow-hidden relative">
                              {cover ? (
                                <Image src={cover} alt={p.name} fill sizes="44px" style={{ objectFit: "cover" }} />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Search className="h-4 w-4 text-brand-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-brand-900 truncate">
                                {p.name}
                              </p>
                              {p.brand && (
                                <p className="text-[10px] text-brand-500">
                                  {p.brand}
                                </p>
                              )}
                            </div>
                            {p.price != null && (
                              <span className="text-xs font-bold text-brand-950 tabular-nums shrink-0">
                                {formatPrice(p.price)}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
