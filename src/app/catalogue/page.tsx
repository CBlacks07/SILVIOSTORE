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
    <div className="min-h-screen bg-gradient-to-b from-brand-50/30 to-white">
      {/* Category hero */}
      <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')]"></div>
        <div className="container-page py-12 md:py-16 relative z-10">
          <nav className="mb-6 flex items-center gap-2 text-xs text-white/60">
            <Link href="/" className="hover:text-white transition-colors font-medium">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/catalogue" className="hover:text-white transition-colors font-medium">Catalogue</Link>
            {activeCat && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-white font-semibold">{activeCat.name}</span>
              </>
            )}
          </nav>

          <div className="flex items-end justify-between gap-8">
            <div className="flex-1">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                {activeCat ? activeCat.name : "Tous les accessoires"}
              </h1>
              {activeCat?.description && (
                <p className="mt-4 text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">{activeCat.description}</p>
              )}
              {!activeCat && (
                <p className="mt-4 text-white/80 text-base md:text-lg">Luxe, tendance et protection réunis.</p>
              )}
            </div>
            <div className="shrink-0 text-right bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <span className="text-3xl md:text-4xl font-black tabular-nums block">{products.length}</span>
              <p className="text-xs text-white/70 mt-1 uppercase tracking-wider font-semibold">produit{products.length > 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Top banners inside hero */}
          {topBanners.length > 0 && (
            <div className="mt-10 grid md:grid-cols-2 gap-5">
              {topBanners.map((b) => {
                const content = (
                  <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md group hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    {b.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.image_url} alt={b.title} className="w-full h-auto block" loading="lazy" />
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-white text-lg">{b.title}</h3>
                      {b.subtitle && <p className="mt-2 text-sm text-white/70 leading-relaxed">{b.subtitle}</p>}
                      {b.cta_label && (
                        <span className="mt-3 inline-flex items-center gap-2 text-accent text-sm font-semibold group-hover:gap-3 transition-all">
                          {b.cta_label} <ArrowRight className="h-4 w-4" />
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
        <div className="border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white shadow-sm">
          <div className="container-page py-4 flex flex-wrap items-center gap-3">
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
