import { listAllBanners } from "@/lib/settings";
import { BannerManager } from "@/components/admin/BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await listAllBanners();
  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
            <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Marketing</span>
          </div>
          <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Bannières et publicités</h1>
        </div>
      </header>
      <div className="px-4 py-4 md:px-8 md:py-6">
        <p className="text-sm text-brand-600 mb-4">
          Gérez les visuels promotionnels affichés sur la boutique (hero, milieu de page d'accueil, haut de catalogue).
        </p>
        <BannerManager initial={banners} />
      </div>
    </>
  );
}
