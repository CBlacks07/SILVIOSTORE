import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getFedaPayTransaction } from "@/lib/fedapay";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const event = (await req.json()) as {
      entity: { id: number; custom_metadata: { order_reference: string } };
    };

    const txId = event.entity.id;
    if (!txId) return NextResponse.json({ ok: true });

    const tx = await getFedaPayTransaction(txId);
    const orderRef =
      (tx.metadata as any).order_reference ||
      event.entity.custom_metadata.order_reference;
    if (!orderRef) return NextResponse.json({ ok: true });

    if (tx.status === "approved") {
      await sql.begin(async (trx) => {
        const updated = await trx<{ id: string; promo_code: string | null }[]>`
          update orders
          set status = 'paid', paid_at = coalesce(paid_at, now())
          where reference = ${orderRef}
            and status = 'pending'
            and (payment_reference is null or payment_reference = ${String(txId)})
          returning id, promo_code
        `;
        const order = updated[0];
        if (!order) return;

        await trx`
          with item_qty as (
            select product_id, sum(quantity)::int as qty
            from order_items
            where order_id = ${order.id}
              and product_id is not null
            group by product_id
          )
          update products p
          set stock = greatest(0, p.stock - item_qty.qty)
          from item_qty
          where p.id = item_qty.product_id
        `;

        if (order.promo_code) {
          await trx`update promotions set used_count = used_count + 1 where code = ${order.promo_code}`;
        }

        // Send confirmation email (best-effort)
        try {
          const fullOrder = await sql<{ email: string; full_name: string; total_amount: number; shipping_address: string | null }[]>`
            SELECT u.email, u.full_name, o.total_amount,
              CONCAT(a.street, ', ', a.city, ', ', a.country) as shipping_address
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            LEFT JOIN addresses a ON a.id = o.shipping_address_id
            WHERE o.id = ${order.id} LIMIT 1
          `;
          const items = await sql<{ name: string; quantity: number; unit_price: number }[]>`
            SELECT p.name, oi.quantity, oi.unit_price
            FROM order_items oi JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = ${order.id}
          `;
          if (fullOrder[0]?.email) {
            await sendOrderConfirmation({
              reference: orderRef,
              customerName: fullOrder[0].full_name || "Client",
              customerEmail: fullOrder[0].email,
              items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.unit_price })),
              total: fullOrder[0].total_amount,
              shippingAddress: fullOrder[0].shipping_address || undefined,
            });
          }
        } catch (emailErr) {
          console.error("email confirmation error", emailErr);
        }
      });
    } else if (["canceled", "declined", "failed"].includes(tx.status)) {
      await sql`
        update orders
        set status = 'cancelled'
        where reference = ${orderRef}
          and status = 'pending'
          and (payment_reference is null or payment_reference = ${String(txId)})
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("fedapay webhook", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
