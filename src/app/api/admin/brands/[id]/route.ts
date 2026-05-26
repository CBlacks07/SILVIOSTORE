import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidUUID, invalidId } from "@/lib/utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!isValidUUID(params.id)) return invalidId();

  const body = await req.json();
  const allowed = ["name", "slug", "logo_url", "sort_order", "is_active"] as const;
  const patch: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) patch[k] = body[k];

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucun champ à modifier" }, { status: 400 });
  }

  try {
    const rows = await sql`update brands set ${sql(patch)} where id = ${params.id} returning *`;
    if (!rows[0]) return NextResponse.json({ error: "Marque introuvable" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  await sql`delete from brands where id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
