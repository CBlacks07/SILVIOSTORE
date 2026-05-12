import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { name, slug } = await req.json();
  if (!name) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  try {
    const rows = await sql`
      insert into brands (name, slug)
      values (${name}, ${slug || slugify(name)})
      returning *
    `;
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 400 });
  }
}
