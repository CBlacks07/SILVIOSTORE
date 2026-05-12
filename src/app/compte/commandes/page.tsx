import Link from "next/link";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFedaPayTransaction } from "@/lib/fedapay";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { RetryPaymentButton } from "@/components/order/RetryPaymentButton";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
  paid: { label: "Payée", cls: "bg-blue-100 text-blue-800" },
  preparing: { label: "En préparation", cls: "bg-blue-100 text-blue-800" },
  shipped: { label: "Expédiée", cls: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Livrée", cls: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée", cls: "bg-red-100 text-red-800" }
};

export default async function OrdersPage() {
  const user = (await getCurrentUser())!;
  const initialOrders = await sql<Order[]>`
    select * from orders where user_id = ${user.id} order by created_at desc
  `;

  const pendingOrders = initialOrders.filter((o) => o.status === "pending" && o.payment_reference);
  if (pendingOrders.length > 0) {
    for (const order of pendingOrders) {
      try {
        const tx = await getFedaPayTransaction(Number(order.payment_reference));
        if (["canceled", "declined", "failed"].includes(tx.status)) {
          await sql`
            update orders
            set status = 'cancelled'
            where id = ${order.id}
              and status = 'pending'
          `;
        }
      } catch {
        // Keep pending if remote check fails.
      }
    }
  }

  const orders = await sql<Order[]>`
    select * from orders where user_id = ${user.id} order by created_at desc
  `;

  return (
    <div className="card p-6">
      <h2 className="mb-4 font-semibold text-brand-950">Mes commandes</h2>

      {orders.length === 0 ? (
        <p className="text-sm text-brand-600">Vous n'avez encore passé aucune commande.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-brand-500">
                <th className="py-2">Référence</th>
                <th className="py-2">Date</th>
                <th className="py-2">Statut</th>
                <th className="py-2 text-right">Total</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = STATUS_LABEL[o.status] || STATUS_LABEL.pending;
                return (
                  <tr key={o.id} className="border-b border-brand-100 last:border-0">
                    <td className="py-3 font-medium text-brand-950">{o.reference}</td>
                    <td className="py-3 text-brand-600">{new Date(o.created_at).toLocaleDateString("fr-FR")}</td>
                    <td className="py-3"><span className={"badge " + s.cls}>{s.label}</span></td>
                    <td className="py-3 text-right text-brand-900">{formatPrice(o.total)}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {o.status === "pending" && <RetryPaymentButton reference={o.reference} compact />}
                        <Link href={"/commande/" + o.reference} className="text-accent hover:text-accent-dark">
                          Détails
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
