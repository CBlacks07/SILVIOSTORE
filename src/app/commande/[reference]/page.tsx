import Link from "next/link";
import Image from "next/image";
import { Check, Clock, X, MessageCircle, Package, Truck, Star, type LucideIcon } from "lucide-react";
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

const TIMELINE_STEPS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "pending",   label: "En attente",       icon: Clock },
  { key: "paid",      label: "Paiement confirmé", icon: Check },
  { key: "preparing", label: "En préparation",    icon: Package },
  { key: "shipped",   label: "Expédiée",          icon: Truck },
  { key: "delivered", label: "Livrée",            icon: Star }
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0, paid: 1, preparing: 2, shipped: 3, delivered: 4, cancelled: -1
};

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

  const items = await sql<(OrderItem & { product_image?: string | null })[]>`
    select oi.*, p.images as product_images
    from order_items oi
    left join products p on p.id = oi.product_id
    where oi.order_id = ${order.id}
  `;

  const isPaid = ["paid", "preparing", "shipped", "delivered"].includes(order.status);
  const isCancelled = order.status === "cancelled";
  const currentStep = STATUS_ORDER[order.status] ?? 0;
  const progressPct = isCancelled ? 0 : Math.round((currentStep / 4) * 100);

  const whatsappPhone = "+22892602519";
  const whatsappMsg = encodeURIComponent(`Bonjour, je souhaite suivre ma commande n°${order.reference}. Merci.`);
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/\D/g, "")}?text=${whatsappMsg}`;

  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "40px 16px" }}>

      {/* Status card */}
      <div style={{ background: "#fff", borderRadius: "20px", padding: "36px 32px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #f0ebe3", marginBottom: "24px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "999px", margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: isPaid ? "rgba(22,163,74,0.12)" : isCancelled ? "rgba(239,68,68,0.12)" : "rgba(217,119,6,0.12)"
        }}>
          {isPaid ? <Check size={32} color="#16a34a" /> : isCancelled ? <X size={32} color="#ef4444" /> : <Clock size={32} color="#d97706" />}
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 700, color: "#121826", margin: "0 0 8px" }}>
          {isPaid ? "Commande confirmée" : isCancelled ? "Paiement annulé" : "Paiement en attente"}
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 4px" }}>
          Référence : <strong style={{ color: "#121826", fontFamily: "monospace" }}>{order.reference}</strong>
        </p>
        {isPaid && (
          <p style={{ fontSize: "14px", color: "#6b7280", margin: "8px 0 0", lineHeight: 1.6 }}>
            Merci pour votre commande. Notre équipe la prépare et vous contactera pour la livraison.
          </p>
        )}
        {!isPaid && !isCancelled && (
          <div style={{ marginTop: "16px" }}>
            <RetryPaymentButton reference={order.reference} />
          </div>
        )}
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div style={{ background: "#fff", borderRadius: "16px", padding: "28px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #f0ebe3", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#121826", marginBottom: "20px" }}>Suivi de commande</h2>

          {/* Progress bar */}
          <div style={{ height: "6px", background: "#f3f0eb", borderRadius: "999px", overflow: "hidden", marginBottom: "28px" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg,#d97706,#f59e0b)", borderRadius: "999px", transition: "width 0.5s ease" }} />
          </div>

          {/* Steps */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", overflowX: "auto" }}>
            {TIMELINE_STEPS.map((step, idx) => {
              const done = currentStep >= idx;
              const active = currentStep === idx;
              const Icon = step.icon;
              return (
                <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 0", minWidth: "60px", gap: "8px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? (active ? "#d97706" : "#1a1008") : "#f3f0eb",
                    border: active ? "2px solid #f59e0b" : "2px solid transparent",
                    boxShadow: active ? "0 0 0 4px rgba(217,119,6,0.15)" : "none",
                    transition: "all 0.3s"
                  }}>
                    <Icon size={18} color={done ? "#fff" : "#9ca3af"} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: active ? 700 : 500, color: done ? "#121826" : "#9ca3af", textAlign: "center", lineHeight: 1.3, whiteSpace: "pre-wrap" }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Products */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #f0ebe3", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#121826", marginBottom: "16px" }}>Produits commandés</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {items.map((it) => {
            const productImages: string[] = (it as any).product_images || [];
            const cover = productImages[0];
            return (
              <div key={it.id} style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "12px", borderBottom: "1px solid #f3f0eb" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "10px", background: "#f9f6f1", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                  {cover ? (
                    <Image src={cover} alt={it.product_name} fill sizes="56px" style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Package size={20} color="#c4b49a" />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#121826", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.product_name}</p>
                  {it.variant_label && <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 2px" }}>{it.variant_label}</p>}
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>Qté {it.quantity}</p>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#121826", flexShrink: 0 }}>{formatPrice(it.unit_price * it.quantity)}</span>
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div style={{ marginTop: "16px", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#6b7280" }}>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
            <span style={{ color: "#6b7280" }}>Livraison</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700, borderTop: "1px solid #f3f0eb", paddingTop: "10px", marginTop: "4px" }}>
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #f0ebe3", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#121826", marginBottom: "12px" }}>Livraison</h2>
        <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 4px" }}>{order.customer_name} — {order.customer_phone}</p>
        <p style={{ fontSize: "14px", color: "#374151", margin: "0 0 4px" }}>{order.shipping_address}</p>
        <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>{order.shipping_city}, {order.shipping_country}</p>
      </div>

      {/* CTA buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "#25D366", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <MessageCircle size={18} />
          Suivre ma commande sur WhatsApp
        </a>
        <Link
          href="/catalogue"
          style={{ background: "#1a1008", color: "#fff", padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
