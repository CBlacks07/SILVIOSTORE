import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidUUID, invalidId } from "@/lib/utils";

const FIELDS = ["title", "subtitle", "image_url", "link_url", "cta_label", "position", "sort_order", "is_active", "starts_at", "ends_at"] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!isValidUUID(params.id)) return invalidId();

  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const k of FIELDS) if (k in body) patch[k] = body[k];

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucun champ à modifier" }, { status: 400 });
  }

  try {
    const rows = await sql`update banners set ${sql(patch)} where id = ${params.id} returning *`;
    if (!rows[0]) return NextResponse.json({ error: "Bannière introuvable" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  await sql`delete from banners where id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
