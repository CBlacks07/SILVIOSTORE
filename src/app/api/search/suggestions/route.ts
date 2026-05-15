import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (q.length < 2) {
      return NextResponse.json({ products: [], categories: [] });
    }

    const pattern = `%${q}%`;

    const products = await sql<{ slug: string; name: string; brand: string | null; price: number; images: string[] }[]>`
      SELECT slug, name, brand, price, images
      FROM products
      WHERE is_active = true
        AND (name ILIKE ${pattern} OR brand ILIKE ${pattern})
      ORDER BY is_featured DESC, name ASC
      LIMIT 5
    `;

    const categories = await sql<{ slug: string; name: string }[]>`
      SELECT slug, name
      FROM categories
      WHERE name ILIKE ${pattern}
      ORDER BY name ASC
      LIMIT 3
    `;

    return NextResponse.json({ products, categories });
  } catch (e: any) {
    return NextResponse.json({ products: [], categories: [] });
  }
}
