import Link from "next/link";
import { ArrowUpRight, Shield, Users } from "lucide-react";
import { sql } from "@/lib/db";
import { UserRoleManager } from "@/components/admin/UserRoleManager";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string;
  role: "customer" | "admin";
  created_at: string;
  order_count: number;
};

export default async function AdminUsersPage() {
  const [stats] = await sql<{ total: number; admins: number; customers: number; this_month: number }[]>`
    select
      count(*)::int                                                          as total,
      count(*) filter (where role = 'admin')::int                           as admins,
      count(*) filter (where role = 'customer')::int                        as customers,
      count(*) filter (where created_at >= date_trunc('month', now()))::int as this_month
    from users
  `;

  const users = await sql<Row[]>`
    select
      u.id, u.full_name, u.phone, u.email, u.role, u.created_at,
      count(o.id) filter (where o.status != 'cancelled')::int as order_count
    from users u
    left join orders o on o.user_id = u.id
    group by u.id
    order by u.created_at desc
  `;

  const KPI_CARDS = [
    { label: "Total membres",    value: stats.total,      icon: Users,  color: "bg-brand-50 text-brand-700" },
    { label: "Administrateurs",  value: stats.admins,     icon: Shield, color: "bg-rose-50 text-rose-700" },
    { label: "Clients",          value: stats.customers,  icon: Users,  color: "bg-sky-50 text-sky-700" },
    { label: "Nouveaux ce mois", value: stats.this_month, icon: ArrowUpRight, color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
              <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Equipe</span>
            </div>
            <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Utilisateurs</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 md:px-8 md:py-6 space-y-4 md:space-y-5">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {KPI_CARDS.map((k) => (
            <div key={k.label} className="card p-4 md:p-5 flex items-center gap-3 md:gap-4">
              <div className={"h-9 w-9 md:h-10 md:w-10 rounded-xl grid place-items-center shrink-0 " + k.color}>
                <k.icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-brand-500 leading-tight">{k.label}</p>
                <p className="font-display text-xl md:text-2xl font-bold text-brand-950 tabular-nums leading-tight">{k.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-brand-100 bg-white overflow-hidden">
          <div className="px-4 py-3 md:px-6 md:py-4 border-b border-brand-100">
            <h2 className="font-display font-semibold text-brand-950">Liste des membres</h2>
            <p className="text-xs text-brand-500 mt-0.5">{users.length} compte{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}</p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-brand-50/60 border-b border-brand-100">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500">Membre</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500">Téléphone</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500 text-center">Commandes</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500">Inscrit le</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {users.map((u) => {
                  const initials = u.full_name
                    ? u.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
                    : u.email.slice(0, 2).toUpperCase();
                  const date = new Date(u.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "short", year: "numeric"
                  });
                  return (
                    <tr key={u.id} className="hover:bg-brand-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={
                            "h-9 w-9 rounded-full grid place-items-center text-[13px] font-bold shrink-0 " +
                            (u.role === "admin" ? "bg-brand-950 text-white" : "bg-brand-100 text-brand-700")
                          }>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-brand-950 truncate leading-tight">
                              {u.full_name || <span className="text-brand-400 italic">Sans nom</span>}
                            </p>
                            <p className="text-xs text-brand-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-brand-700 text-sm">{u.phone || "—"}</td>
                      <td className="px-4 py-4 text-center">
                        {u.order_count > 0 ? (
                          <Link
                            href={`/admin/commandes?user=${u.id}`}
                            className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 transition-colors"
                          >
                            {u.order_count}
                          </Link>
                        ) : (
                          <span className="text-brand-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-brand-600 text-sm tabular-nums">{date}</td>
                      <td className="px-4 py-4">
                        <UserRoleManager userId={u.id} role={u.role} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-brand-50">
            {users.map((u) => {
              const initials = u.full_name
                ? u.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
                : u.email.slice(0, 2).toUpperCase();
              const date = new Date(u.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
              return (
                <div key={u.id} className="px-4 py-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={
                      "h-9 w-9 rounded-full grid place-items-center text-[13px] font-bold shrink-0 " +
                      (u.role === "admin" ? "bg-brand-950 text-white" : "bg-brand-100 text-brand-700")
                    }>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-950 truncate text-sm">
                        {u.full_name || <span className="text-brand-400 italic">Sans nom</span>}
                      </p>
                      <p className="text-xs text-brand-500 truncate">{u.email}</p>
                    </div>
                    <UserRoleManager userId={u.id} role={u.role} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-brand-500 pl-12">
                    <span>{u.phone || "—"}</span>
                    <span>·</span>
                    <span>Inscrit le {date}</span>
                    {u.order_count > 0 && (
                      <>
                        <span>·</span>
                        <Link href={`/admin/commandes?user=${u.id}`} className="text-accent font-medium">
                          {u.order_count} commande{u.order_count > 1 ? "s" : ""}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-3 md:px-6 border-t border-brand-50 text-xs text-brand-400">
            {users.filter(u => u.role === "admin").length} admin{users.filter(u => u.role === "admin").length > 1 ? "s" : ""} · {users.filter(u => u.role === "customer").length} client{users.filter(u => u.role === "customer").length > 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </>
  );
}
