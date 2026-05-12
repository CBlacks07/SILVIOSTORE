import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const FIELDS = ["title", "subtitle", "image_url", "link_url", "cta_label", "position", "sort_order", "is_active", "starts_at", "ends_at"] as const;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json();
  if (!body.title) return NextResponse.json({ error: "Titre requis" }, { status: 400 });

  const record: Record<string, unknown> = {};
  for (const k of FIELDS) if (k in body) record[k] = body[k];

  try {
    const rows = await sql`insert into banners ${sql(record)} returning *`;
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}
