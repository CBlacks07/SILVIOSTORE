import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const FIELDS = ["code", "description", "discount_type", "discount_value", "min_order", "max_uses", "starts_at", "ends_at", "is_active"] as const;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json();
  if (!body.code || typeof body.code !== "string") {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }
  if (!["percent", "amount"].includes(body.discount_type)) {
    return NextResponse.json({ error: "Type de remise invalide" }, { status: 400 });
  }
  if (typeof body.discount_value !== "number" || body.discount_value < 0) {
    return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
  }
  if (body.discount_type === "percent" && body.discount_value > 100) {
    return NextResponse.json({ error: "Pourcentage max 100" }, { status: 400 });
  }

  const record: Record<string, unknown> = {};
  for (const k of FIELDS) if (k in body) record[k] = body[k];
  record.code = String(body.code).toUpperCase();

  try {
    const rows = await sql`insert into promotions ${sql(record)} returning *`;
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}
