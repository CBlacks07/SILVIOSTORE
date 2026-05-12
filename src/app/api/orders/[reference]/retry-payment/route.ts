import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { COUNTRY_TO_ISO, createFedaPayCheckout } from "@/lib/fedapay";
import type { Order } from "@/lib/types";

const FEDAPAY_SANDBOX_SUCCESS_NUMBERS = new Set(["64000001", "66000001"]);

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

    const user = await getCurrentUser();
    if (order.user_id && (!user || user.id !== order.user_id)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const callbackPath = order.user_id ? "/compte/commandes" : "/commande/" + order.reference;
    const [firstname, ...rest] = (order.customer_name || "Client").trim().split(" ");
    const lastname = rest.join(" ") || firstname || "Client";

    const isSandbox = (process.env.FEDAPAY_ENVIRONMENT || "sandbox") !== "live";
    const phoneDigits = String(order.customer_phone || "").replace(/\D/g, "");
    const sandboxTestIso = isSandbox && FEDAPAY_SANDBOX_SUCCESS_NUMBERS.has(phoneDigits) ? "bj" : null;

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
        countryIso: sandboxTestIso || COUNTRY_TO_ISO[order.shipping_country] || "tg"
      }
    });

    await sql`
      update orders
      set payment_reference = ${String(fp.transactionId)}
      where id = ${order.id}
        and status = 'pending'
    `;

    return NextResponse.json({ ok: true, paymentUrl: fp.paymentUrl });
  } catch (e: any) {
    console.error("retry payment error", e);
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}
