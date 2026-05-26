import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidUUID, invalidId } from "@/lib/utils";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!isValidUUID(params.id)) return invalidId();

  const body = await req.json();
  if (typeof body.is_approved !== "boolean") {
    return NextResponse.json({ error: "is_approved requis" }, { status: 400 });
  }

  const rows = await sql<{ id: string; is_approved: boolean }[]>`
    update product_reviews
    set is_approved = ${body.is_approved}
    where id = ${params.id}
    returning id, is_approved
  `;

  if (!rows[0]) return NextResponse.json({ error: "Avis introuvable" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  await sql`delete from product_reviews where id = ${params.id}`;
  return NextResponse.json({ ok: true });
}

