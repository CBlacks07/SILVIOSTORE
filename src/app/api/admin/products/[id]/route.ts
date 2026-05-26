import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify, isValidUUID, invalidId } from "@/lib/utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!isValidUUID(params.id)) return invalidId();

  const b = await req.json();
  try {
    const specs = Array.isArray(b.specifications) ? b.specifications.filter((s: any) => s.label && s.value) : null;
    const faq = Array.isArray(b.faq) ? b.faq.filter((f: any) => f.question && f.answer) : null;
    const rows = await sql`
      update products set
        name             = ${b.name},
        slug             = ${b.slug || slugify(b.name)},
        brand            = ${b.brand || null},
        category_id      = ${b.category_id},
        description      = ${b.description || null},
        long_description = ${b.long_description || null},
        price            = ${b.price},
        compare_at_price = ${b.compare_at_price},
        stock            = ${b.stock},
        sku              = ${b.sku || null},
        is_active        = ${!!b.is_active},
        is_featured      = ${!!b.is_featured},
        images           = ${sql.array(b.images || [])},
        specifications   = ${specs && specs.length > 0 ? sql.json(specs) : null},
        faq              = ${faq && faq.length > 0 ? sql.json(faq) : null}
      where id = ${params.id}
      returning *
    `;
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await sql`delete from products where id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}
