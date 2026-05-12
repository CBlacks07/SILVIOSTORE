"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Brand, Category } from "@/lib/types";

type Props = {
  categories: Pick<Category, "slug" | "name">[];
  brands: Pick<Brand, "id" | "name">[];
  activeCategory: string;
  activeBrand: string;
  q: string;
  prixMin: string;
  prixMax: string;
};

export function CatalogueSidebar({ categories, brands, activeCategory, activeBrand, q, prixMin, prixMax }: Props) {
  const [catQuery, setCatQuery] = useState("");
  const [showAllCats, setShowAllCats] = useState(false);

  const filteredCats = useMemo(() => {
    const s = catQuery.trim().toLowerCase();
    if (!s) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(s));
  }, [catQuery, categories]);

  const visibleCats = showAllCats ? filteredCats : filteredCats.slice(0, 10);
  const hasMore = filteredCats.length > 10;

  return (
    <aside className="lg:sticky lg:top-24 space-y-4">
      <form action="/catalogue" className="card p-5 space-y-5">
        {q && <input type="hidden" name="q" defaultValue={q} />}

        <section>
          <h3 className="text-sm font-semibold text-brand-950 mb-3">Catégories</h3>
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand-400" />
            <input
              type="text"
              value={catQuery}
              onChange={(e) => setCatQuery(e.target.value)}
              placeholder="Rechercher une catégorie"
              className="block w-full rounded-md border border-brand-200 bg-white pl-8 pr-2 py-1.5 text-xs transition-colors placeholder:text-brand-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="space-y-0.5 text-sm max-h-[280px] overflow-y-auto pr-1">
            {!catQuery && (
              <Link
                href="/catalogue"
                className={
                  "block rounded px-2 py-1.5 transition-colors " +
                  (!activeCategory
                    ? "bg-brand-900 text-white font-medium"
                    : "text-brand-700 hover:bg-brand-50")
                }
              >
                Toutes
              </Link>
            )}
            {visibleCats.map((c) => (
              <Link
                key={c.slug}
                href={"/catalogue?categorie=" + c.slug}
                className={
                  "block rounded px-2 py-1.5 transition-colors " +
                  (activeCategory === c.slug
                    ? "bg-brand-900 text-white font-medium"
                    : "text-brand-700 hover:bg-brand-50")
                }
              >
                {c.name}
              </Link>
            ))}
            {filteredCats.length === 0 && (
              <p className="px-2 py-1.5 text-xs text-brand-400">Aucune catégorie</p>
            )}
          </div>
          {hasMore && (
            <button
              type="button"
              onClick={() => setShowAllCats((v) => !v)}
              className="mt-2 text-xs font-medium text-accent hover:text-accent-dark"
            >
              {showAllCats ? "Voir moins" : "Voir plus (" + (filteredCats.length - 10) + ")"}
            </button>
          )}
        </section>

        <section className="border-t border-brand-100 pt-4">
          <h3 className="text-sm font-semibold text-brand-950 mb-3">Marque</h3>
          <select name="marque" defaultValue={activeBrand || ""} className="input">
            <option value="">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </section>

        <section className="border-t border-brand-100 pt-4">
          <h3 className="text-sm font-semibold text-brand-950 mb-3">Prix (XOF)</h3>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" name="prixMin" defaultValue={prixMin} placeholder="Min" className="input" />
            <input type="number" name="prixMax" defaultValue={prixMax} placeholder="Max" className="input" />
          </div>
        </section>

        {activeCategory && <input type="hidden" name="categorie" defaultValue={activeCategory} />}

        <div className="border-t border-brand-100 pt-4 flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">Filtrer</button>
          <Link href="/catalogue" className="btn-outline">Réinitialiser</Link>
        </div>
      </form>
    </aside>
  );
}


