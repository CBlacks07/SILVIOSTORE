import Link from "next/link";
import { Check, Clock, X } from "lucide-react";
import { sql } from "@/lib/db";
import { getFedaPayTransaction } from "@/lib/fedapay";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem } from "@/lib/types";
import { RetryPaymentButton } from "@/components/order/RetryPaymentButton";

export const dynamic = "force-dynamic";

async function syncOrderFromFedaPay(reference: string): Promise<Order | null> {
  const rows = await sql<Order[]>`select * from orders where reference = ${reference} limit 1`;
  const order = rows[0];
  if (!order) return null;
  if (order.status !== "pending" || !order.payment_reference) return order;

  try {
    const tx = await getFedaPayTransaction(Number(order.payment_reference));
    if (tx.status === "approved") {
      const updated = await sql<Order[]>`
        update orders
        set status = 'paid', paid_at = coalesce(paid_at, now())
        where id = ${order.id}
          and status = 'pending'
        returning *
      `;
      return updated[0] || { ...order, status: "paid", paid_at: order.paid_at ?? new Date().toISOString() };
    }
    if (["canceled", "declined", "failed"].includes(tx.status)) {
      const updated = await sql<Order[]>`
        update orders
        set status = 'cancelled'
        where id = ${order.id}
          and status = 'pending'
        returning *
      `;
      return updated[0] || { ...order, status: "cancelled" };
    }
  } catch (e) {
    console.error("sync FedaPay status", e);
  }
  return order;
}

export default async function OrderConfirmationPage({ params }: { params: { reference: string } }) {
  const order = await syncOrderFromFedaPay(params.reference);

  if (!order) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-brand-950">Commande introuvable</h1>
        <Link href="/panier" className="btn-primary mt-6 inline-flex">Retour au panier</Link>
      </div>
    );
  }

  const items = await sql<OrderItem[]>`select * from order_items where order_id = ${order.id}`;

  const isPaid = ["paid", "preparing", "shipped", "delivered"].includes(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="container-page py-12 max-w-3xl">
      <div className="card p-8 text-center">
        <div className={
          "mx-auto h-14 w-14 rounded-full grid place-items-center " +
          (isPaid ? "bg-green-100 text-green-700" : isCancelled ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")
        }>
          {isPaid ? <Check className="h-7 w-7" /> : isCancelled ? <X className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-brand-950">
          {isPaid ? "Commande confirmée" : isCancelled ? "Paiement annulé" : "Paiement en attente"}
        </h1>
        <p className="mt-2 text-brand-600 text-sm">
          Référence : <span className="font-medium text-brand-900">{order.reference}</span>
        </p>
        {isPaid && (
          <p className="mt-2 text-sm text-brand-600">
            Merci pour votre commande. Notre équipe la prépare et vous contactera pour la livraison.
          </p>
        )}
        {!isPaid && !isCancelled && <RetryPaymentButton reference={order.reference} />}
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-semibold text-brand-950 mb-4">Détails de la commande</h2>
        <div className="space-y-3 text-sm">
          {items.map((it) => (
            <div key={it.id} className="flex justify-between border-b border-brand-100 pb-2 last:border-0">
              <div>
                <p className="font-medium text-brand-950">{it.product_name}</p>
                {it.variant_label && <p className="text-xs text-brand-500">{it.variant_label}</p>}
                <p className="text-xs text-brand-500">Qté {it.quantity}</p>
              </div>
              <span className="text-brand-900">{formatPrice(it.unit_price * it.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-brand-600">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-brand-600">Livraison</span><span>{formatPrice(order.shipping_cost)}</span></div>
          <div className="flex justify-between text-base font-semibold border-t border-brand-100 pt-2 mt-2">
            <span>Total</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-semibold text-brand-950 mb-3">Livraison</h2>
        <p className="text-sm text-brand-700">{order.customer_name} - {order.customer_phone}</p>
        <p className="text-sm text-brand-700">{order.shipping_address}</p>
        <p className="text-sm text-brand-700">{order.shipping_city}, {order.shipping_country}</p>
      </div>

      <div className="mt-8 text-center">
        <Link href="/panier" className="btn-primary">Continuer mes achats</Link>
      </div>
    </div>
  );
}
