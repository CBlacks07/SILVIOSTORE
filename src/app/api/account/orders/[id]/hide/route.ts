import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  // Toggle is_hidden — only for own orders, only cancelled or paid
  const rows = await sql<{ is_hidden: boolean }[]>`
    UPDATE orders
    SET is_hidden = NOT is_hidden
    WHERE id = ${params.id}
      AND user_id = ${user.id}
      AND status IN ('cancelled', 'paid', 'delivered')
    RETURNING is_hidden
  `;

  if (!rows[0]) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  return NextResponse.json({ is_hidden: rows[0].is_hidden });
}
