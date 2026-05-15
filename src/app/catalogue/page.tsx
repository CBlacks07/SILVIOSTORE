import Link from "next/link";
import { ArrowRight, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { SortSelect } from "@/components/catalogue/SortSelect";
import { MobileFilterDrawer } from "@/components/catalogue/MobileFilterDrawer";
import { CatalogueSidebar } from "@/components/catalogue/CatalogueSidebar";
import { getCategories, searchProducts } from "@/lib/queries";
import { listActiveBanners, listActiveBrands } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Search = {
  q: string;
  categorie: string;
  marque: string;
  prixMin: string;
  prixMax: string;
  tri: string;
};

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const categories = await getCategories();
  const activeCat = categories.find((c) => c.slug === searchParams.categorie);
  return {
    title: activeCat ? activeCat.name + " — SILVIO STORE" : "Catalogue — SILVIO STORE",
    description: activeCat?.description || "Parcourez notre catalogue d'accessoires premium.",
  };
}

export default async function CataloguePage({ searchParams }: { searchParams: Search }) {
  const [products, categories, brands, topBanners] = await Promise.all([
    searchProducts({
      q: searchParams.q,
      categorie: searchParams.categorie,
      marque: searchParams.marque,
      prixMin: searchParams.prixMin ? Number(searchParams.prixMin) : undefined,
      prixMax: searchParams.prixMax ? Number(searchParams.prixMax) : undefined,
      tri: (searchParams.tri as any) || "recent",
    }),
    getCategories(),
    listActiveBrands(),
    listActiveBanners("catalogue_top"),
  ]);

  const activeCat = categories.find((c) => c.slug === searchParams.categorie);
  const hasFilters = Boolean(
    searchParams.q || searchParams.categorie || searchParams.marque || searchParams.prixMin || searchParams.prixMax
  );

  const buildUrl = (omit: string) => {
    const params = new URLSearchParams();
    if (searchParams.q && omit !== "q") params.set("q", searchParams.q);
    if (searchParams.categorie && omit !== "categorie") params.set("categorie", searchParams.categorie);
    if (searchParams.marque && omit !== "marque") params.set("marque", searchParams.marque);
    if (searchParams.prixMin && omit !== "prix") params.set("prixMin", searchParams.prixMin);
    if (searchParams.prixMax && omit !== "prix") params.set("prixMax", searchParams.prixMax);
    if (searchParams.tri) params.set("tri", searchParams.tri);
    const qs = params.toString();
    return "/catalogue" + (qs ? "?" + qs : "");
  };

  const activeFilters: { key: string; label: string; removeHref: string }[] = [];
  if (searchParams.q) activeFilters.push({ key: "q", label: `"${searchParams.q}"`, removeHref: buildUrl("q") });
  if (searchParams.categorie) activeFilters.push({ key: "categorie", label: activeCat?.name || searchParams.categorie, removeHref: buildUrl("categorie") });
  if (searchParams.marque) activeFilters.push({ key: "marque", label: searchParams.marque, removeHref: buildUrl("marque") });
  if (searchParams.prixMin || searchParams.prixMax) {
    activeFilters.push({ key: "prix", label: `${searchParams.prixMin || "0"} – ${searchParams.prixMax || "∞"} FCFA`, removeHref: buildUrl("prix") });
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Category hero */}
      <div className="bg-brand-950 text-white">
        <div className="container-page py-10 md:py-12">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
            {activeCat && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-brand-200 font-medium">{activeCat.name}</span>
              </>
            )}
          </nav>

          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">
                {activeCat ? activeCat.name : "Tous les accessoires"}
              </h1>
              {activeCat?.description && (
                <p className="mt-2 text-brand-300 text-sm max-w-lg">{activeCat.description}</p>
              )}
              {!activeCat && (
                <p className="mt-2 text-brand-300 text-sm">Luxe, tendance et protection réunis.</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <span className="text-2xl font-bold tabular-nums">{products.length}</span>
              <p className="text-xs text-brand-400 mt-0.5">produit{products.length > 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Top banners inside hero */}
          {topBanners.length > 0 && (
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {topBanners.map((b) => {
                const content = (
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 group hover:bg-white/10 transition-colors">
                    {b.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image_url} alt={b.title} className="w-full h-auto block" loading="lazy" />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-white">{b.title}</h3>
                      {b.subtitle && <p className="mt-1 text-sm text-brand-300">{b.subtitle}</p>}
                      {b.cta_label && (
                        <span className="mt-2 inline-flex items-center gap-1 text-accent text-sm font-medium">
                          {b.cta_label} <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                );
                return b.link_url ? <Link key={b.id} href={b.link_url}>{content}</Link> : <div key={b.id}>{content}</div>;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active filters bar */}
      {activeFilters.length > 0 && (
        <div className="border-b border-brand-100 bg-brand-50">
          <div className="container-page py-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-500 shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtres :
            </span>
            {activeFilters.map((f) => (
              <Link
                key={f.key}
                href={f.removeHref}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-brand-200 text-brand-800 text-xs font-medium hover:border-brand-400 hover:bg-brand-50 transition-all"
              >
                {f.label}
                <X className="h-3 w-3 text-brand-400" />
              </Link>
            ))}
            <Link href="/catalogue" className="text-xs font-semibold text-accent hover:text-accent-dark transition-colors ml-1">
              Tout effacer
            </Link>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container-page py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <CatalogueSidebar
              categories={categories}
              brands={brands}
              activeCategory={searchParams.categorie}
              activeBrand={searchParams.marque}
              q={searchParams.q}
              prixMin={searchParams.prixMin}
              prixMax={searchParams.prixMax}
            />
          </aside>

          {/* Right column */}
          <div>
            {/* Toolbar */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <p className="text-sm text-brand-600">
                  <span className="font-semibold text-brand-950">{products.length}</span>{" "}
                  résultat{products.length > 1 ? "s" : ""}
                </p>
                {/* Mobile Filter Trigger */}
                <div className="lg:hidden">
                   <MobileFilterDrawer
                      categories={categories}
                      brands={brands}
                      activeCategory={searchParams.categorie}
                      activeBrand={searchParams.marque}
                      q={searchParams.q}
                      prixMin={searchParams.prixMin}
                      prixMax={searchParams.prixMax}
                      resultCount={products.length}
                   />
                </div>
              </div>
              <SortSelect value={searchParams.tri || "recent"} />
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-10 md:p-16 text-center">
                <div className="h-16 w-16 rounded-full bg-brand-100 grid place-items-center mx-auto mb-4">
                  <SlidersHorizontal className="h-7 w-7 text-brand-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-brand-950 mb-2">Aucun produit trouvé</h3>
                <p className="text-sm text-brand-600 mb-5">
                  Essayez d'ajuster vos filtres ou parcourez tout le catalogue.
                </p>
                <Link href="/catalogue" className="btn-accent inline-flex">
                  Voir tout le catalogue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
