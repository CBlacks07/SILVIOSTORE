import { sql } from "@/lib/db";
import { ReviewManager } from "@/components/admin/ReviewManager";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  product_name: string;
  product_slug: string;
};

export default async function AdminReviewsPage() {
  const rows = await sql<ReviewRow[]>`
    select
      r.id,
      r.product_id,
      r.author_name,
      r.rating,
      r.comment,
      r.is_verified_purchase,
      r.is_approved,
      r.created_at,
      p.name as product_name,
      p.slug as product_slug
    from product_reviews r
    join products p on p.id = r.product_id
    order by r.created_at desc
    limit 300
  `;

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
            <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Ventes</span>
          </div>
          <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Avis clients</h1>
        </div>
      </header>
      <div className="px-4 py-4 md:px-8 md:py-6">
        <p className="mb-4 text-sm text-brand-600">
          Modérez les avis publiés sur les fiches accessoires.
        </p>
        <ReviewManager initial={rows} />
      </div>
    </>
  );
}
