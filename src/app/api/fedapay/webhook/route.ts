import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getFedaPayTransaction } from "@/lib/fedapay";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(req: Request) {
  // Read raw body
  const rawBody = await req.text();

  // 1. Vérification du secret webhook (header personnalisé configuré dans FedaPay)
  const webhookSecret = process.env.FEDAPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const receivedSecret = req.headers.get("x-webhook-secret") ?? "";
    if (receivedSecret !== webhookSecret) {
      console.error("webhook: invalid secret header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const event = JSON.parse(rawBody) as {
      entity: { id: number; custom_metadata?: { order_reference?: string } };
    };

    const txId = event.entity?.id;
    if (!txId) return NextResponse.json({ ok: true });

    // 2. Idempotence: skip if this webhook event was already processed
    const already = await sql`select 1 from webhook_events where fedapay_tx_id = ${txId} limit 1`;
    if (already.length > 0) return NextResponse.json({ ok: true });

    // 3. Fetch transaction details from FedaPay API
    const tx = await getFedaPayTransaction(txId);
    const orderRef =
      (tx.metadata as any)?.order_reference ??
      event.entity.custom_metadata?.order_reference;
    if (!orderRef) return NextResponse.json({ ok: true });

    if (tx.status === "approved") {
      let emailPayload: {
        email: string; name: string;
        items: { name: string; quantity: number; price: number }[];
        total: number;
      } | null = null;

      await sql.begin(async (trx) => {
        // 4. Lock the order row to prevent race conditions from simultaneous webhooks
        const rows = await trx<{
          id: string; total: number; status: string;
          promo_code: string | null; stock_reserved: boolean;
          customer_email: string | null; customer_name: string;
        }[]>`
          select id, total, status, promo_code, stock_reserved, customer_email, customer_name
          from orders
          where reference = ${orderRef}
          for update
        `;
        const order = rows[0];
        if (!order || order.status !== "pending") return;

        // 5. Verify amount — reject if FedaPay amount doesn't match order total
        if (Math.abs(tx.amount - order.total) > 1) {
          await trx`
            update orders set status = 'cancelled', failed_reason = 'amount_mismatch'
            where id = ${order.id}
          `;
          await trx`
            insert into payment_logs
              (order_id, event_type, status_before, status_after, fedapay_tx_id, amount_expected, amount_received, metadata)
            values
              (${order.id}, 'amount_mismatch', 'pending', 'cancelled', ${txId},
               ${order.total}, ${tx.amount}, ${JSON.stringify({ orderRef })}::jsonb)
          `;
          console.error(`webhook: amount mismatch ${orderRef} — expected ${order.total}, received ${tx.amount}`);
          return;
        }

        // 6. Mark order as paid
        await trx`
          update orders set status = 'paid', paid_at = coalesce(paid_at, now())
          where id = ${order.id}
        `;

        // 7. Decrement stock only if not already reserved at checkout
        if (!order.stock_reserved) {
          await trx`
            with item_qty as (
              select product_id, sum(quantity)::int as qty
              from order_items
              where order_id = ${order.id} and product_id is not null
              group by product_id
            )
            update products p
            set stock = greatest(0, p.stock - item_qty.qty)
            from item_qty
            where p.id = item_qty.product_id
          `;
        }

        // 8. Increment promo usage (only on successful payment)
        if (order.promo_code) {
          await trx`
            update promotions set used_count = used_count + 1
            where code = ${order.promo_code}
          `;
        }

        // 9. Mark webhook as processed (idempotence key)
        await trx`
          insert into webhook_events (fedapay_tx_id, order_id, event_status)
          values (${txId}, ${order.id}, 'approved')
          on conflict (fedapay_tx_id) do nothing
        `;

        // 10. Audit log
        await trx`
          insert into payment_logs
            (order_id, event_type, status_before, status_after, fedapay_tx_id, amount_expected, amount_received, metadata)
          values
            (${order.id}, 'approved', 'pending', 'paid', ${txId},
             ${order.total}, ${tx.amount}, ${JSON.stringify({ orderRef })}::jsonb)
        `;

        // 11. Collect email data (sent AFTER transaction commits)
        if (order.customer_email) {
          const orderItems = await trx<{ product_name: string; quantity: number; unit_price: number }[]>`
            select product_name, quantity, unit_price from order_items where order_id = ${order.id}
          `;
          emailPayload = {
            email: order.customer_email,
            name: order.customer_name || "Client",
            items: orderItems.map(i => ({ name: i.product_name, quantity: i.quantity, price: i.unit_price })),
            total: tx.amount,
          };
        }
      });

      // 12. Send confirmation email after transaction commits (best-effort)
      if (emailPayload) {
        try {
          await sendOrderConfirmation({
            reference: orderRef,
            customerName: emailPayload.name,
            customerEmail: emailPayload.email,
            items: emailPayload.items,
            total: emailPayload.total,
            shippingAddress: undefined,
          });
        } catch (err) {
          console.error("confirmation email error", err);
        }
      }
    } else if (["canceled", "declined", "failed"].includes(tx.status)) {
      await sql.begin(async (trx) => {
        // Lock order row
        const rows = await trx<{ id: string; status: string; stock_reserved: boolean; total: number }[]>`
          select id, status, stock_reserved, total
          from orders
          where reference = ${orderRef}
          for update
        `;
        const order = rows[0];
        if (!order || order.status !== "pending") return;

        // Cancel with reason
        await trx`
          update orders set status = 'cancelled', failed_reason = ${tx.status}
          where id = ${order.id}
        `;

        // Restore reserved stock
        if (order.stock_reserved) {
          await trx`
            with item_qty as (
              select product_id, sum(quantity)::int as qty
              from order_items
              where order_id = ${order.id} and product_id is not null
              group by product_id
            )
            update products p
            set stock = p.stock + item_qty.qty
            from item_qty
            where p.id = item_qty.product_id
          `;
        }

        // Record idempotence
        await trx`
          insert into webhook_events (fedapay_tx_id, order_id, event_status)
          values (${txId}, ${order.id}, ${tx.status})
          on conflict (fedapay_tx_id) do nothing
        `;

        // Audit log
        await trx`
          insert into payment_logs
            (order_id, event_type, status_before, status_after, fedapay_tx_id, amount_expected, amount_received, metadata)
          values
            (${order.id}, 'failed', 'pending', 'cancelled', ${txId},
             ${order.total}, ${tx.amount}, ${JSON.stringify({ orderRef, reason: tx.status })}::jsonb)
        `;
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("fedapay webhook error", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
