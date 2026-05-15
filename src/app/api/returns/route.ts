import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { order_reference, email, reason, description } = await req.json();

    if (!order_reference || !email || !reason) {
      return NextResponse.json({ ok: false, error: "Champs requis manquants" }, { status: 400 });
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS return_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_reference TEXT NOT NULL,
        email TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    const [row] = await sql<{ id: string }[]>`
      INSERT INTO return_requests (order_reference, email, reason, description)
      VALUES (${order_reference.trim()}, ${email.trim().toLowerCase()}, ${reason}, ${description || null})
      RETURNING id
    `;

    return NextResponse.json({ ok: true, id: row.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
