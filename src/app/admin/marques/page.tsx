import { listAllBrands } from "@/lib/settings";
import { BrandManager } from "@/components/admin/BrandManager";
import { Info, Tags } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await listAllBrands();
  const activeCount = brands.filter((b) => b.is_active).length;
  const withLogo = brands.filter((b) => b.logo_url).length;

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="px-8 py-4">
          <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
            <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Catalogue</span>
          </div>
          <h1 className="font-display text-[22px] font-bold text-brand-950">Marques</h1>
        </div>
      </header>

      <div className="px-8 py-6">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>
          {/* Main */}
          <div>
            <BrandManager initial={brands} />
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="rounded-xl border border-brand-100 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-4">Statistiques</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-700">Total marques</span>
                  <span className="font-bold text-brand-950">{brands.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-700">Actives</span>
                  <span className="font-bold text-green-700">{activeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-700">Avec logo</span>
                  <span className="font-bold text-brand-950">{withLogo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-700">Sans logo</span>
                  <span className="font-bold text-amber-600">{brands.length - withLogo}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-brand-500 shrink-0" />
                <p className="text-xs font-bold uppercase tracking-widest text-brand-500">Conseils</p>
              </div>
              <ul className="space-y-2.5 text-sm text-brand-600 leading-relaxed">
                <li className="flex gap-2"><span className="text-accent shrink-0">›</span>Les marques actives apparaissent dans la section "Grandes marques" de l'accueil.</li>
                <li className="flex gap-2"><span className="text-accent shrink-0">›</span>Uploadez un logo en PNG transparent pour un meilleur rendu.</li>
                <li className="flex gap-2"><span className="text-accent shrink-0">›</span>L'ordre détermine la position dans les filtres du catalogue.</li>
              </ul>
            </div>

            <div className="rounded-xl border border-brand-100 bg-white p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 grid place-items-center text-brand-400 shrink-0">
                <Tags className="h-5 w-5" />
              </div>
              <p className="text-xs text-brand-500 leading-relaxed">
                Les marques sont visibles dans les filtres du catalogue et dans le formulaire de création produit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
