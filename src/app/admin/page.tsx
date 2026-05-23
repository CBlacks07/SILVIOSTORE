import Link from "next/link";
import { AlertTriangle, ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";
import { sql } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; dot: string; badge: string }> = {
  pending:   { label: "En attente",     dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-800 ring-amber-200" },
  paid:      { label: "Payée",          dot: "bg-sky-400",     badge: "bg-sky-50 text-sky-800 ring-sky-200" },
  preparing: { label: "En préparation", dot: "bg-indigo-400",  badge: "bg-indigo-50 text-indigo-800 ring-indigo-200" },
  shipped:   { label: "Expédiée",       dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-800 ring-violet-200" },
  delivered: { label: "Livrée",         dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  cancelled: { label: "Annulée",        dot: "bg-rose-400",    badge: "bg-rose-50 text-rose-800 ring-rose-200" },
};

export default async function AdminDashboardPage() {
  const [kpi] = await sql<{
    revenue: number;
    orders: number;
    customers: number;
    avg_basket: number;
  }[]>`
    select
      coalesce(sum(total), 0)::int                                          as revenue,
      count(*)::int                                                          as orders,
      count(distinct coalesce(user_id::text, customer_email, customer_phone))::int as customers,
      coalesce(avg(total), 0)::int                                          as avg_basket
    from orders
    where created_at >= now() - interval '14 days'
      and status != 'cancelled'
  `;

  const [kpiPrev] = await sql<{ revenue: number; orders: number }[]>`
    select
      coalesce(sum(total), 0)::int as revenue,
      count(*)::int                as orders
    from orders
    where created_at >= now() - interval '28 days'
      and created_at < now() - interval '14 days'
      and status != 'cancelled'
  `;

  const pipeline = await sql<{ status: string; count: number }[]>`
    select status, count(*)::int as count
    from orders
    where created_at >= now() - interval '30 days'
    group by status
  `;

  const pipelineMap = Object.fromEntries(pipeline.map((p) => [p.status, p.count]));

  const recentOrders = await sql<{
    id: string; reference: string; customer_name: string;
    status: string; total: number; created_at: string;
    shipping_city: string; shipping_country: string;
  }[]>`
    select id, reference, customer_name, status, total, created_at, shipping_city, shipping_country
    from orders order by created_at desc limit 8
  `;

  const lowStock = await sql<{ id: string; name: string; stock: number; brand: string | null; images: string[] }[]>`
    select id, name, stock, brand, images from products where stock < 10 order by stock asc limit 6
  `;

  const dailyRevenue = await sql<{ day: string; total: number }[]>`
    select
      to_char(date_trunc('day', created_at), 'DD/MM') as day,
      coalesce(sum(total), 0)::int                 as total
    from orders
    where status != 'cancelled'
      and created_at >= now() - interval '30 days'
    group by date_trunc('day', created_at)
    order by date_trunc('day', created_at)
  `;

  const topProducts = await sql<{ product_name: string; total_qty: number; total_revenue: number }[]>`
    select
      oi.product_name,
      sum(oi.quantity)::int                   as total_qty,
      sum(oi.quantity * oi.unit_price)::int   as total_revenue
    from order_items oi
    join orders o on o.id = oi.order_id
    where o.status != 'cancelled'
      and o.created_at >= now() - interval '30 days'
    group by oi.product_name
    order by total_qty desc
    limit 5
  `;

  const revMax = Math.max(...dailyRevenue.map((d) => d.total), 1);
  const topMax = Math.max(...topProducts.map((p) => p.total_qty), 1);

  const revPct = (kpiPrev.revenue > 0)
    ? ((kpi.revenue - kpiPrev.revenue) / kpiPrev.revenue) * 100
    : 0;
  const ordersPct = (kpiPrev.orders > 0)
    ? ((kpi.orders - kpiPrev.orders) / kpiPrev.orders) * 100
    : 0;

  const PIPELINE_STATUSES = ["pending", "paid", "preparing", "shipped", "delivered"] as const;

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
              <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Vue générale</span>
            </div>
            <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Tableau de bord</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:px-8 md:py-6 space-y-4 md:space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <KpiCard label="Chiffre d'affaires" value={formatPrice(kpi.revenue)} pct={revPct} sub="14 derniers jours" />
          <KpiCard label="Commandes" value={kpi.orders} pct={ordersPct} sub="14 derniers jours" />
          <KpiCard label="Nouveaux clients" value={kpi.customers} pct={null} sub="14 derniers jours" />
          <KpiCard label="Panier moyen" value={formatPrice(kpi.avg_basket)} pct={null} sub="14 derniers jours" />
        </div>

        {/* Pipeline */}
        <div className="card p-4 md:p-5">
          <div className="flex items-baseline justify-between mb-4 md:mb-5">
            <div>
              <h2 className="font-display font-semibold text-brand-950">Pipeline des commandes</h2>
              <p className="text-xs text-brand-500 mt-0.5">État du flux des 30 derniers jours</p>
            </div>
            <Link href="/admin/commandes" className="text-xs text-accent hover:text-accent-dark flex items-center gap-1">
              Détails <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 md:gap-4">
            {PIPELINE_STATUSES.map((status) => {
              const meta = STATUS_META[status];
              const count = pipelineMap[status] || 0;
              const total = Object.values(pipelineMap).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={status} className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={"h-2 w-2 rounded-full shrink-0 " + meta.dot} />
                    <span className="text-xs text-brand-500 truncate">{meta.label}</span>
                  </div>
                  <div className="font-display text-2xl font-bold text-brand-950 tabular-nums">{count}</div>
                  <div className="mt-2 h-1 rounded-full bg-brand-100 overflow-hidden">
                    <div className={"h-full rounded-full " + meta.dot} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom — stacked on mobile, 2-column on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 md:gap-5">
          {/* Recent orders */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-brand-100">
              <div>
                <h2 className="font-display font-semibold text-brand-950">Commandes récentes</h2>
                <p className="text-xs text-brand-500 mt-0.5">Les 8 dernières commandes reçues</p>
              </div>
              <Link href="/admin/commandes" className="text-xs text-accent hover:text-accent-dark flex items-center gap-1">
                Tout voir <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-brand-400 bg-brand-50/50 border-b border-brand-100">
                    <th className="px-6 py-2.5 font-medium">Référence</th>
                    <th className="px-4 py-2.5 font-medium">Client</th>
                    <th className="px-4 py-2.5 font-medium">Statut</th>
                    <th className="px-6 py-2.5 font-medium text-right">Total</th>
                    <th className="px-6 py-2.5 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const s = STATUS_META[o.status] || STATUS_META.pending;
                    const initials = o.customer_name.split(" ").map((p: string) => p[0]).slice(0, 2).join("");
                    const date = new Date(o.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
                    const time = new Date(o.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <tr key={o.id} className="border-b border-brand-50 last:border-0 hover:bg-brand-50/30 transition-colors">
                        <td className="px-6 py-3">
                          <Link href={`/admin/commandes/${o.id}`} className="font-mono text-[12px] font-semibold text-brand-950 hover:text-accent transition-colors">
                            {o.reference}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-brand-950 text-white grid place-items-center text-[11px] font-bold shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-brand-950 font-medium text-sm truncate leading-tight">{o.customer_name}</div>
                              <div className="text-[11px] text-brand-400 leading-tight">{o.shipping_city}, {o.shipping_country}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ring-1 ring-inset ${s.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-semibold tabular-nums text-brand-950 text-sm">
                          {formatPrice(o.total)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="text-sm text-brand-700 tabular-nums">{date}</div>
                          <div className="text-[11px] text-brand-400">{time}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-brand-50">
              {recentOrders.map((o) => {
                const s = STATUS_META[o.status] || STATUS_META.pending;
                const date = new Date(o.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
                return (
                  <div key={o.id} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Link href={`/admin/commandes/${o.id}`} className="font-mono text-xs font-semibold text-brand-950 hover:text-accent">
                        {o.reference}
                      </Link>
                      <span className="text-xs text-brand-400">{date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-700 truncate mr-2">{o.customer_name}</span>
                      <span className="font-semibold text-sm text-brand-950 tabular-nums shrink-0">{formatPrice(o.total)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brand-400">{o.shipping_city}, {o.shipping_country}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset ${s.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4 md:space-y-5">
            {/* Revenue bar chart — 30 jours */}
            <div className="card p-4 md:p-5">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h2 className="font-display font-semibold text-brand-950">Chiffre d'affaires</h2>
                  <p className="text-xs text-brand-500 mt-0.5">30 derniers jours · en FCFA</p>
                </div>
              </div>
              <div className="flex items-end gap-px h-32" style={{ overflowX: "auto" }}>
                {dailyRevenue.length === 0 ? (
                  <p className="text-xs text-brand-400 self-center mx-auto">Pas de données</p>
                ) : (
                  dailyRevenue.map((d, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", flex: 1, minWidth: "10px" }} className="group">
                      <div
                        style={{
                          width: "100%",
                          borderRadius: "2px 2px 0 0",
                          background: "#d97706",
                          height: `${Math.max(4, (d.total / revMax) * 100)}%`,
                          opacity: 0.8,
                          transition: "opacity 0.15s"
                        }}
                        title={`${d.day}: ${formatPrice(d.total)}`}
                        className="analytics-bar"
                      />
                      <span style={{ fontSize: "8px", color: "#9ca3af", whiteSpace: "nowrap" }}>{d.day}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top 5 produits */}
            <div className="card p-4 md:p-5">
              <div className="mb-4">
                <h2 className="font-display font-semibold text-brand-950">Top produits vendus</h2>
                <p className="text-xs text-brand-500 mt-0.5">30 derniers jours</p>
              </div>
              {topProducts.length === 0 ? (
                <p className="text-xs text-brand-400 text-center py-4">Pas de données</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-brand-800 font-medium truncate flex-1 mr-2 leading-tight">{p.product_name}</span>
                        <span className="text-xs font-bold text-brand-950 tabular-nums shrink-0">{p.total_qty} vendus</span>
                      </div>
                      <div style={{ height: "6px", background: "#f3f0eb", borderRadius: "999px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            borderRadius: "999px",
                            background: "linear-gradient(90deg,#d97706,#f59e0b)",
                            width: `${Math.round((p.total_qty / topMax) * 100)}%`,
                            transition: "width 0.4s"
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-brand-400 mt-0.5 text-right">{formatPrice(p.total_revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low stock */}
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 md:px-5 md:py-4 border-b border-brand-100">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <div>
                  <h2 className="font-display font-semibold text-brand-950 text-sm">Stock faible</h2>
                  <p className="text-xs text-brand-500">{lowStock.length} produits sous 10 unités</p>
                </div>
              </div>
              <ul className="divide-y divide-brand-50">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-4 py-3 md:px-5 hover:bg-brand-50/40 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-brand-100 shrink-0 overflow-hidden">
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-brand-950 truncate leading-tight">{p.name}</div>
                      <div className="text-[11px] text-brand-500 leading-tight mt-0.5">{p.brand || "—"}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-display font-bold text-lg tabular-nums leading-none ${p.stock === 0 ? "text-rose-600" : "text-amber-600"}`}>
                        {p.stock}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider text-brand-400 mt-0.5">{p.stock === 0 ? "rupture" : "restants"}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function KpiCard({ label, value, pct, sub }: { label: string; value: string | number; pct: number | null; sub: string }) {
  const isUp = pct !== null && pct >= 0;
  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs md:text-sm text-brand-500 leading-tight">{label}</span>
        {pct !== null && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] md:text-[11px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? "+" : ""}{pct.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-xl md:text-[26px] font-bold text-brand-950 tabular-nums leading-none">
        {value}
      </div>
      <p className="mt-2 text-[10px] md:text-[11px] text-brand-400">{sub}</p>
    </div>
  );
}
