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
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
              <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Ventes</span>
            </div>
            <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Commandes</h1>
          </div>
          <a
            href="/api/admin/orders/export"
            download
            style={{ background: "#1a1008", color: "#fff", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            Exporter CSV
          </a>
        </div>
      </header>

      <div className="px-4 py-4 md:px-8 md:py-6">
        {/* Desktop table */}
        <div className="hidden md:block card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-brand-500 border-b border-brand-100 bg-brand-50/60">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Référence</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Client</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Ville</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Statut</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const s = STATUS_LABEL[o.status] || STATUS_LABEL.pending;
                return (
                  <tr key={o.id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/40">
                    <td className="px-4 py-3">
                      <Link href={"/admin/commandes/" + o.id} className="font-medium text-brand-950 hover:text-accent font-mono text-xs">
                        {o.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-brand-700 text-xs">{new Date(o.created_at).toLocaleString("fr-FR")}</td>
                    <td className="px-4 py-3 text-brand-700">{o.customer_name}</td>
                    <td className="px-4 py-3 text-brand-700">{o.shipping_city}, {o.shipping_country}</td>
                    <td className="px-4 py-3"><span className={"badge " + s.cls}>{s.label}</span></td>
                    <td className="px-4 py-3 text-right text-brand-900 font-semibold">{formatPrice(o.total)}</td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-brand-500">Aucune commande</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {orders.map((o) => {
            const s = STATUS_LABEL[o.status] || STATUS_LABEL.pending;
            const date = new Date(o.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
            return (
              <Link
                key={o.id}
                href={"/admin/commandes/" + o.id}
                className="card p-3 block hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-semibold text-brand-950">{o.reference}</span>
                  <span className="text-xs text-brand-400">{date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-brand-800 font-medium">{o.customer_name}</p>
                    <p className="text-xs text-brand-500">{o.shipping_city}, {o.shipping_country}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-brand-950">{formatPrice(o.total)}</p>
                    <span className={"badge text-[10px] mt-1 " + s.cls}>{s.label}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {orders.length === 0 && (
            <div className="card px-4 py-10 text-center text-sm text-brand-500">Aucune commande</div>
          )}
        </div>

        {orders.length > 0 && (
          <p className="mt-3 text-xs text-brand-400 text-center md:text-left">
            {orders.length} commande{orders.length > 1 ? "s" : ""}
          </p>
        )}
      </div>
    </>
  );
}
