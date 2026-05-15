import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql<{ buyer: string; city: string; product: string; created_at: string }[]>`
      SELECT
        COALESCE(u.full_name, 'Un client') AS buyer,
        COALESCE(a.city, 'Lomé') AS city,
        p.name AS product,
        o.created_at
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN users u ON u.id = o.user_id
      LEFT JOIN addresses a ON a.id = o.shipping_address_id
      WHERE o.status IN ('paid', 'preparing', 'shipped', 'delivered')
      ORDER BY o.created_at DESC
      LIMIT 20
    `;
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}
