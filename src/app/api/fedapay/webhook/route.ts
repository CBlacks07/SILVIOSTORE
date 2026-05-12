import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getFedaPayTransaction } from "@/lib/fedapay";

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
