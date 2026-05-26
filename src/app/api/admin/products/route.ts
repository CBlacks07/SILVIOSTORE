import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const b = await req.json();
  try {
    const specs = Array.isArray(b.specifications) ? b.specifications.filter((s: any) => s.label && s.value) : null;
    const faq = Array.isArray(b.faq) ? b.faq.filter((f: any) => f.question && f.answer) : null;
    const highlights = Array.isArray(b.highlights) ? b.highlights.filter((h: any) => typeof h === "string" && h.trim()) : null;
    const rows = await sql`
      insert into products (
        name, slug, brand, category_id, description, long_description,
        price, compare_at_price, stock, sku,
        is_active, is_featured, images, specifications, faq, highlights
      ) values (
        ${b.name}, ${b.slug || slugify(b.name)}, ${b.brand || null}, ${b.category_id}, ${b.description || null}, ${b.long_description || null},
        ${b.price}, ${b.compare_at_price}, ${b.stock}, ${b.sku || null},
        ${!!b.is_active}, ${!!b.is_featured}, ${sql.array(b.images || [])},
        ${specs && specs.length > 0 ? sql.json(specs) : null},
        ${faq && faq.length > 0 ? sql.json(faq) : null},
        ${highlights && highlights.length > 0 ? sql.json(highlights) : null}
      )
      returning *
    `;
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}
