"use client";

import Link from "next/link";
import { LayoutGrid, ArrowRight, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/types";

type Props = {
  categories: Pick<Category, "slug" | "name">[];
};

export function HeaderNav({ categories }: Props) {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {/* Categories Dropdown */}
      <div className="group relative">
        <button className="flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-brand-900 hover:text-accent hover:bg-brand-50 rounded-lg transition-all duration-200">
          <LayoutGrid className="h-4 w-4" />
          EXPLORER
        </button>

        {/* Dropdown Menu */}
        <div className="absolute left-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
          <div className="w-80 bg-white rounded-2xl shadow-2xl border border-brand-100 overflow-hidden">
            {/* Categories Grid */}
            <div className="grid grid-cols-2 gap-1 p-4 max-h-96 overflow-y-auto">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/catalogue?categorie=${c.slug}`}
                  className="px-3 py-2.5 text-xs text-brand-700 hover:bg-accent/10 hover:text-accent rounded-lg transition-all duration-200 font-medium hover:translate-x-1"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gradient-to-r from-brand-50/50 to-brand-50 border-t border-brand-100">
              <Link
                href="/catalogue"
                className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-accent hover:text-brand-950 transition-colors group"
              >
                Voir tous les articles{" "}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <Link
        href="/"
        className="px-3 py-2.5 text-xs font-bold text-brand-600 hover:text-accent hover:bg-brand-50 rounded-lg transition-all duration-200"
      >
        ACCUEIL
      </Link>
      <Link
        href="/retours"
        className="px-3 py-2.5 text-xs font-bold text-brand-600 hover:text-accent hover:bg-brand-50 rounded-lg transition-all duration-200"
      >
        RETOURS
      </Link>
      <Link
        href="/livraison"
        className="px-3 py-2.5 text-xs font-bold text-brand-600 hover:text-accent hover:bg-brand-50 rounded-lg transition-all duration-200"
      >
        LIVRAISON
      </Link>
    </nav>
  );
}
