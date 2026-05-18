import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, productId, productName } = await req.json();
    if (!email || !productId) return NextResponse.json({ ok: false }, { status: 400 });

    await sql`
      CREATE TABLE IF NOT EXISTS stock_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        product_id UUID NOT NULL,
        product_name TEXT,
        notified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(email, product_id)
      )
    `;

    await sql`
      INSERT INTO stock_notifications (email, product_id, product_name)
      VALUES (${email.trim().toLowerCase()}, ${productId}, ${productName || null})
      ON CONFLICT (email, product_id) DO NOTHING
    `;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("stock-notify:", e.message);
    return NextResponse.json({ ok: false });
  }
}
