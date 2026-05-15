import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="flex items-center gap-3 px-4 py-3 md:px-8 md:py-4">
          <Link href="/admin/commandes" className="p-1.5 text-brand-500 hover:text-brand-900 hover:bg-brand-100 rounded transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-0.5">
              <span>Admin</span><span>›</span>
              <Link href="/admin/commandes" className="hover:text-brand-700">Commandes</Link>
              <span>›</span><span className="text-brand-700 font-medium">{order.reference}</span>
            </div>
            <h1 className="font-display text-base md:text-xl font-bold text-brand-950">Commande {order.reference}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:px-8 md:py-6">
        <p className="text-sm text-brand-600 mb-4">Passée le {new Date(order.created_at).toLocaleString("fr-FR")}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Articles */}
          <div className="card p-4 md:p-6 lg:col-span-2">
            <h2 className="font-semibold text-brand-950 mb-4">Articles</h2>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-brand-500 border-b border-brand-100">
                    <th className="py-2">Produit</th>
                    <th className="py-2 text-center">Qté</th>
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
                      <td className="py-2.5 text-brand-700 text-center">{it.quantity}</td>
                      <td className="py-2.5 text-right text-brand-700">{formatPrice(it.unit_price)}</td>
                      <td className="py-2.5 text-right text-brand-900 font-medium">{formatPrice(it.unit_price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile items */}
            <div className="sm:hidden space-y-2 mb-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2 border-b border-brand-50 last:border-0">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="font-medium text-brand-950 text-sm truncate">{it.product_name}</p>
                    {it.variant_label && <p className="text-xs text-brand-500">{it.variant_label}</p>}
                    <p className="text-xs text-brand-500">Qté : {it.quantity} × {formatPrice(it.unit_price)}</p>
                  </div>
                  <p className="font-semibold text-brand-900 text-sm shrink-0">{formatPrice(it.unit_price * it.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5 text-sm border-t border-brand-100 pt-4">
              <div className="flex justify-between"><span className="text-brand-600">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-brand-600">Livraison</span><span>{formatPrice(order.shipping_cost)}</span></div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-brand-100">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            <div className="card p-4 md:p-6">
              <h2 className="font-semibold text-brand-950 mb-3">Statut</h2>
              <OrderStatusForm orderId={order.id} status={order.status} />
              {order.payment_reference && (
                <p className="mt-4 text-xs text-brand-500">FedaPay TX #{order.payment_reference}</p>
              )}
              {order.paid_at && (
                <p className="text-xs text-brand-500">Payée le {new Date(order.paid_at).toLocaleString("fr-FR")}</p>
              )}
            </div>

            <div className="card p-4 md:p-6">
              <h2 className="font-semibold text-brand-950 mb-3">Client</h2>
              <p className="text-sm text-brand-900">{order.customer_name}</p>
              <p className="text-sm text-brand-700">{order.customer_phone}</p>
              {order.customer_email && <p className="text-sm text-brand-700">{order.customer_email}</p>}
            </div>

            <div className="card p-4 md:p-6">
              <h2 className="font-semibold text-brand-950 mb-3">Livraison</h2>
              <p className="text-sm text-brand-700">{order.shipping_address}</p>
              <p className="text-sm text-brand-700">{order.shipping_city}, {order.shipping_country}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
