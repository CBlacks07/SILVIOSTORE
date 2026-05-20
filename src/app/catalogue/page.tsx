import Link from "next/link";
import { ArrowRight, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import type { Metadata } from "next";
import { BannerCard } from "@/components/ui/BannerCard";
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
    <div className="min-h-screen bg-gradient-to-b from-brand-50/30 to-white">
      {/* Category hero */}
      <div
        className="text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 50%, #1a1008 100%)" }}
      >
        {/* Warm gold glows */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 100% at 5% 50%, rgba(217,119,6,0.20) 0%, transparent 65%), radial-gradient(ellipse 60% 80% at 95% 50%, rgba(217,119,6,0.10) 0%, transparent 65%)"
        }} />
        <div className="container-page py-10 md:py-14 relative z-10">
          <nav className="mb-5 flex items-center gap-1.5 text-xs font-medium" style={{ color: "rgba(253,230,138,0.80)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="h-3 w-3" style={{ color: "#d97706" }} />
            <Link href="/catalogue" className="hover:text-white transition-colors">Catalogue</Link>
            {activeCat && (
              <>
                <ChevronRight className="h-3 w-3" style={{ color: "#d97706" }} />
                <span className="text-white font-semibold">{activeCat.name}</span>
              </>
            )}
          </nav>

          <div className="flex items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                {activeCat ? activeCat.name : "Tous les accessoires"}
              </h1>
              {activeCat?.description && (
                <p className="mt-3 text-sm md:text-base max-w-2xl leading-relaxed" style={{ color: "rgba(253,230,138,0.90)" }}>{activeCat.description}</p>
              )}
              {!activeCat && (
                <p className="mt-3 text-sm md:text-base" style={{ color: "rgba(253,230,138,0.90)" }}>Luxe, tendance et protection réunis.</p>
              )}
            </div>
            <div className="shrink-0 text-right rounded-xl px-5 py-3" style={{ background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.40)" }}>
              <span className="text-2xl md:text-3xl font-black tabular-nums block text-white">{products.length}</span>
              <p className="text-[10px] mt-0.5 uppercase tracking-widest font-bold" style={{ color: "#f59e0b" }}>produit{products.length > 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Top banners */}
          {topBanners.length > 0 && (
            <div className="mt-10 grid md:grid-cols-2 gap-5">
              {topBanners.map((b) => <BannerCard key={b.id} banner={b} />)}
            </div>
          )}
        </div>
      </div>

      {/* Active filters bar */}
      {activeFilters.length > 0 && (
        <div className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white shadow-sm">
          <div className="container-page py-5 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-sm font-bold text-brand-700 shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres actifs :
            </span>
            {activeFilters.map((f) => (
              <Link
                key={f.key}
                href={f.removeHref}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-brand-200 text-brand-800 text-sm font-semibold hover:border-accent hover:bg-accent/5 transition-all shadow-sm hover:shadow-md"
              >
                {f.label}
                <X className="h-4 w-4 text-brand-500" />
              </Link>
            ))}
            <Link href="/catalogue" className="text-sm font-bold text-accent hover:text-accent-dark transition-colors ml-2 underline underline-offset-4">
              Tout effacer
            </Link>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container-page py-10 md:py-12">
        <div className="catalogue-layout">
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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white rounded-2xl p-5 border border-brand-100 shadow-sm">
              <div className="flex items-center justify-between w-full sm:w-auto">
                <p className="text-base text-brand-700 font-medium">
                  <span className="font-black text-brand-950 text-lg">{products.length}</span>{" "}
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
              <div className="rounded-3xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white p-12 md:p-20 text-center shadow-lg">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 grid place-items-center mx-auto mb-6 shadow-md">
                  <SlidersHorizontal className="h-9 w-9 text-brand-500" />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-brand-950 mb-3">Aucun produit trouvé</h3>
                <p className="text-base text-brand-600 mb-6 max-w-md mx-auto leading-relaxed">
                  Essayez d'ajuster vos filtres ou parcourez tout le catalogue.
                </p>
                <Link href="/catalogue" className="btn-accent inline-flex text-base px-8 py-3">
                  Voir tout le catalogue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-7">
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
