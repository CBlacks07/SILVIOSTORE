import { sql } from "@/lib/db";
import { PromotionManager } from "@/components/admin/PromotionManager";
import type { Promotion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const rows = await sql<Promotion[]>`select * from promotions order by created_at desc`;
  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
            <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Ventes</span>
          </div>
          <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Codes promotionnels</h1>
        </div>
      </header>
      <div className="px-4 py-4 md:px-8 md:py-6">
        <p className="text-sm text-brand-600 mb-4">
          Remises appliquées au panier lors du paiement. Le client saisit le code au checkout.
        </p>
        <PromotionManager initial={rows} />
      </div>
    </>
  );
}
