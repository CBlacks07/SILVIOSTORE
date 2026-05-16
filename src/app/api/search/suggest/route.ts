import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (q.length < 2) {
    return NextResponse.json({ products: [], categories: [], brands: [] });
  }

  const like = `%${q}%`;
  const starts = `${q}%`;

  try {
    const [products, categories] = await Promise.all([
      sql<{ slug: string; name: string; brand: string | null; price: number; images: string[] }[]>`
        select slug, name, brand, price, images
        from products
        where is_active = true
          and (name ilike ${like} or coalesce(brand, '') ilike ${like})
        order by
          case when name ilike ${starts} then 0 else 1 end,
          created_at desc
        limit 6
      `,
      sql<{ slug: string; name: string }[]>`
        select slug, name
        from categories
        where name ilike ${like}
        order by sort_order asc, name asc
        limit 4
      `,
    ]);

    return NextResponse.json({ products, categories });
  } catch (e: any) {
    console.error("suggest error:", e.message);
    return NextResponse.json({ products: [], categories: [] });
  }
}

