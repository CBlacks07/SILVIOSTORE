import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import type { Order, OrderItem } from "@/lib/types";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const orders = await sql<Order[]>`select * from orders where id = ${params.id} limit 1`;
  const order = orders[0];
  if (!order) notFound();
  const items = await sql<OrderItem[]>`select * from order_items where order_id = ${order.id}`;

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-bold text-brand-950">Commande {order.reference}</h1>
      <p className="mt-1 text-sm text-brand-600">Passée le {new Date(order.created_at).toLocaleString("fr-FR")}</p>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-brand-950 mb-4">Articles</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-500 border-b border-brand-100">
                <th className="py-2">Produit</th>
                <th className="py-2">Qté</th>
                <th className="py-2 text-right">PU</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-brand-100 last:border-0">
                  <td className="py-2.5">
                    <p className="font-medium text-brand-950">{it.product_name}</p>
                    {it.variant_label && <p className="text-xs text-brand-500">{it.variant_label}</p>}
                  </td>
                  <td className="py-2.5 text-brand-700">{it.quantity}</td>
                  <td className="py-2.5 text-right text-brand-700">{formatPrice(it.unit_price)}</td>
                  <td className="py-2.5 text-right text-brand-900">{formatPrice(it.unit_price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-1.5 text-sm border-t border-brand-100 pt-4">
            <div className="flex justify-between"><span className="text-brand-600">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-brand-600">Livraison</span><span>{formatPrice(order.shipping_cost)}</span></div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-brand-100">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-brand-950 mb-3">Statut</h2>
            <OrderStatusForm orderId={order.id} status={order.status} />
            {order.payment_reference && (
              <p className="mt-4 text-xs text-brand-500">FedaPay TX #{order.payment_reference}</p>
            )}
            {order.paid_at && (
              <p className="text-xs text-brand-500">Payée le {new Date(order.paid_at).toLocaleString("fr-FR")}</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-brand-950 mb-3">Client</h2>
            <p className="text-sm text-brand-900">{order.customer_name}</p>
            <p className="text-sm text-brand-700">{order.customer_phone}</p>
            {order.customer_email && <p className="text-sm text-brand-700">{order.customer_email}</p>}
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-brand-950 mb-3">Livraison</h2>
            <p className="text-sm text-brand-700">{order.shipping_address}</p>
            <p className="text-sm text-brand-700">{order.shipping_city}, {order.shipping_country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
