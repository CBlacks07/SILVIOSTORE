import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidUUID, invalidId } from "@/lib/utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!isValidUUID(params.id)) return invalidId();

  const body = await req.json();
  const { name, slug, description, image_url, sort_order } = body;

  try {
    const rows = await sql`
      update categories
      set
        name        = ${name        !== undefined ? name        : sql`name`},
        slug        = ${slug        !== undefined ? slug        : sql`slug`},
        description = ${description !== undefined ? description : sql`description`},
        image_url   = ${image_url   !== undefined ? image_url  : sql`image_url`},
        sort_order  = ${sort_order  !== undefined ? sort_order : sql`sort_order`}
      where id = ${params.id}
      returning *
    `;
    if (rows.length === 0) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    await sql`delete from categories where id = ${params.id}`;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}
