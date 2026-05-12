import Link from "next/link";
import { sql } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:    { label: "En attente",      cls: "bg-amber-100 text-amber-800" },
  paid:       { label: "Payée",           cls: "bg-blue-100 text-blue-800" },
  preparing:  { label: "En préparation",  cls: "bg-blue-100 text-blue-800" },
  shipped:    { label: "Expédiée",        cls: "bg-indigo-100 text-indigo-800" },
  delivered:  { label: "Livrée",          cls: "bg-green-100 text-green-800" },
  cancelled:  { label: "Annulée",         cls: "bg-red-100 text-red-800" }
};

export default async function AdminOrdersPage() {
  const orders = await sql<any[]>`
    select id, reference, customer_name, shipping_city, shipping_country, status, total, created_at
    from orders order by created_at desc limit 100
  `;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-brand-950 mb-6">Commandes</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-brand-500 border-b border-brand-100 bg-brand-50/60">
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Ville</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const s = STATUS_LABEL[o.status] || STATUS_LABEL.pending;
              return (
                <tr key={o.id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <Link href={"/admin/commandes/" + o.id} className="font-medium text-brand-950 hover:text-accent">
                      {o.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-700">{new Date(o.created_at).toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3 text-brand-700">{o.customer_name}</td>
                  <td className="px-4 py-3 text-brand-700">{o.shipping_city}, {o.shipping_country}</td>
                  <td className="px-4 py-3"><span className={"badge " + s.cls}>{s.label}</span></td>
                  <td className="px-4 py-3 text-right text-brand-900">{formatPrice(o.total)}</td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-brand-500">Aucune commande</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
