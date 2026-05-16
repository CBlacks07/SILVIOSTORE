import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const safeIds = ids.filter((id) => typeof id === "string").slice(0, 20);

    const results = await Promise.all(
      safeIds.map((id: string) =>
        sql<{ id: string; slug: string; name: string; brand: string | null; price: number; compare_at_price: number | null; images: string[]; stock: number }[]>`
          SELECT id, slug, name, brand, price, compare_at_price, images, stock
          FROM products WHERE id = ${id} AND is_active = true LIMIT 1
        `
      )
    );

    const products = results.flat().filter(Boolean);
    return NextResponse.json({ products });
  } catch (e: any) {
    return NextResponse.json({ products: [] });
  }
}
