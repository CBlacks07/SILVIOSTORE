import { sql } from "@/lib/db";
import { PromotionManager } from "@/components/admin/PromotionManager";
import type { Promotion } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const rows = await sql<Promotion[]>`select * from promotions order by created_at desc`;
  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-2xl font-bold text-brand-950 mb-2">Codes promotionnels</h1>
      <p className="text-sm text-brand-600 mb-6">
        Remises appliquées au panier lors du paiement. Le client saisit le code au checkout.
      </p>
      <PromotionManager initial={rows} />
    </div>
  );
}
