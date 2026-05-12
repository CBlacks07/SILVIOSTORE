import { listAllBanners } from "@/lib/settings";
import { BannerManager } from "@/components/admin/BannerManager";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const banners = await listAllBanners();
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-brand-950 mb-2">Bannières et publicités</h1>
      <p className="text-sm text-brand-600 mb-6">
        Gérez les visuels promotionnels affichés sur la boutique (hero, milieu de page d'accueil, haut de catalogue).
      </p>
      <BannerManager initial={banners} />
    </div>
  );
}
