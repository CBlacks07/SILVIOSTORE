import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await sql<{
      reference: string;
      created_at: string;
      customer_name: string;
      customer_email: string | null;
      total: number;
      status: string;
      shipping_city: string;
      shipping_country: string;
    }[]>`
      SELECT
        o.reference,
        o.created_at,
        o.customer_name,
        o.customer_email,
        o.total,
        o.status,
        o.shipping_city,
        o.shipping_country
      FROM orders o
      WHERE o.status != 'cancelled'
      ORDER BY o.created_at DESC
      LIMIT 5000
    `;

    const itemsRaw = await sql<{ order_reference: string; product_name: string; quantity: number; unit_price: number }[]>`
      SELECT o.reference as order_reference, oi.product_name, oi.quantity, oi.unit_price
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status != 'cancelled'
      ORDER BY o.created_at DESC
    `;

    const itemsByRef: Record<string, string[]> = {};
    for (const it of itemsRaw) {
      if (!itemsByRef[it.order_reference]) itemsByRef[it.order_reference] = [];
      itemsByRef[it.order_reference].push(`${it.product_name} x${it.quantity}`);
    }

    const STATUS_LABELS: Record<string, string> = {
      pending: "En attente",
      paid: "Payee",
      preparing: "En preparation",
      shipped: "Expediee",
      delivered: "Livree",
      cancelled: "Annulee"
    };

    const headers = ["Référence", "Date", "Client", "Email", "Total (FCFA)", "Statut", "Ville", "Pays", "Produits"];

    const rows = orders.map((o) => [
      o.reference,
      new Date(o.created_at).toLocaleDateString("fr-FR"),
      o.customer_name,
      o.customer_email || "",
      String(o.total),
      STATUS_LABELS[o.status] || o.status,
      o.shipping_city,
      o.shipping_country,
      (itemsByRef[o.reference] || []).join(" | ")
    ]);

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="commandes-${date}.csv"`
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
