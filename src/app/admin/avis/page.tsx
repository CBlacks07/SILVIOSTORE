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
    <div className="max-w-6xl">
      <h1 className="mb-2 font-display text-2xl font-bold text-brand-950">Avis clients</h1>
      <p className="mb-6 text-sm text-brand-600">
        Modérez les avis publiés sur les fiches accessoires.
      </p>
      <ReviewManager initial={rows} />
    </div>
  );
}

