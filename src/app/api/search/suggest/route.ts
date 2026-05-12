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

  const [products, categories, brands] = await Promise.all([
    sql<{ slug: string; name: string; brand: string | null }[]>`
      select slug, name, brand
      from products
      where is_active = true
        and (name ilike ${like} or coalesce(brand, '') ilike ${like})
      order by
        case
          when name ilike ${starts} then 0
          when coalesce(brand, '') ilike ${starts} then 1
          else 2
        end,
        created_at desc
      limit 6
    `,
    sql<{ slug: string; name: string }[]>`
      select slug, name
      from categories
      where name ilike ${like}
      order by
        case when name ilike ${starts} then 0 else 1 end,
        sort_order asc,
        name asc
      limit 4
    `,
    sql<{ name: string }[]>`
      select distinct brand as name
      from products
      where is_active = true
        and brand is not null
        and brand ilike ${like}
      order by
        case when brand ilike ${starts} then 0 else 1 end,
        brand asc
      limit 4
    `
  ]);

  return NextResponse.json({ products, categories, brands });
}

