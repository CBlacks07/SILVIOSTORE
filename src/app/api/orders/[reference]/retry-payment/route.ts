import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { COUNTRY_TO_ISO, createFedaPayCheckout } from "@/lib/fedapay";
import type { Order } from "@/lib/types";

export async function POST(_: Request, { params }: { params: { reference: string } }) {
  try {
    const reference = String(params.reference || "").trim();
    if (!reference) return NextResponse.json({ error: "Référence invalide" }, { status: 400 });

    const rows = await sql<Order[]>`select * from orders where reference = ${reference} limit 1`;
    const order = rows[0];
    if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    if (order.status !== "pending") {
      return NextResponse.json({ error: "Cette commande n'est plus en attente de paiement." }, { status: 400 });
    }

    // Anonymous orders cannot be retried via API — prevents anyone who guesses
    // the reference from obtaining a payment URL for someone else's order
    if (!order.user_id) {
      return NextResponse.json({ error: "Veuillez recréer une commande." }, { status: 403 });
    }

    const user = await getCurrentUser();
    if (!user || user.id !== order.user_id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://silviostore.com";
    const callbackPath = "/compte/commandes";
    const [firstname, ...rest] = (order.customer_name || "Client").trim().split(" ");
    const lastname = rest.join(" ") || firstname || "Client";

    const fp = await createFedaPayCheckout({
      amount: order.total,
      description: "Commande " + order.reference,
      reference: order.reference,
      callbackUrl: siteUrl + callbackPath,
      customer: {
        firstname: firstname || "Client",
        lastname,
        email: order.customer_email || "no-reply@silviostore.com",
        phone: order.customer_phone,
        countryIso: COUNTRY_TO_ISO[order.shipping_country] || "tg",
      },
    });

    await sql`
      update orders
      set payment_reference = ${String(fp.transactionId)}
      where id = ${order.id} and status = 'pending'
    `;

    // Audit log
    await sql`
      insert into payment_logs (order_id, event_type, status_before, status_after, metadata)
      values (${order.id}, 'retry', 'pending', 'pending',
        ${JSON.stringify({ reference: order.reference, newTxId: fp.transactionId })}::jsonb)
    `;

    return NextResponse.json({ ok: true, paymentUrl: fp.paymentUrl });
  } catch (e: any) {
    console.error("retry payment error", e);
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}
