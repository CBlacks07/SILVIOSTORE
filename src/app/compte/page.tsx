import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";
import { Package, MapPin, Heart, ChevronRight, ShoppingBag, Clock } from "lucide-react";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;

  const [orderRows, addressRows] = await Promise.all([
    sql<{ count: number; pending: number }[]>`
      select
        count(*)::int as count,
        count(*) filter (where status in ('pending','paid','preparing','shipped'))::int as pending
      from orders where user_id = ${user.id}
    `.catch(() => [{ count: 0, pending: 0 }]),
    sql<{ count: number }[]>`
      select count(*)::int as count from addresses where user_id = ${user.id}
    `.catch(() => [{ count: 0 }]),
  ]);

  const orderCount   = orderRows[0]?.count ?? 0;
  const pendingCount = orderRows[0]?.pending ?? 0;
  const addressCount = addressRows[0]?.count ?? 0;

  const initials = user.full_name
    ? user.full_name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Bienvenue */}
      <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #1a1008, #2c1c06)" }}>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-accent/20 border-2 border-accent/40 grid place-items-center text-lg font-black text-white shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-accent/80 mb-1">Bienvenue</p>
            <h1 className="font-display text-xl font-bold text-white leading-tight">
              {user.full_name || "Mon compte"}
            </h1>
            <p className="text-sm text-white/50 mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Cartes stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/compte/commandes" className="card p-5 hover:border-accent/30 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 grid place-items-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <ChevronRight className="h-4 w-4 text-brand-300 group-hover:text-accent transition-colors" />
          </div>
          <p className="text-2xl font-black text-brand-950">{orderCount}</p>
          <p className="text-xs text-brand-500 mt-0.5">Commande{orderCount > 1 ? "s" : ""}</p>
          {pendingCount > 0 && (
            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" /> {pendingCount} en cours
            </span>
          )}
        </Link>

        <Link href="/compte/adresses" className="card p-5 hover:border-accent/30 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 grid place-items-center">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <ChevronRight className="h-4 w-4 text-brand-300 group-hover:text-accent transition-colors" />
          </div>
          <p className="text-2xl font-black text-brand-950">{addressCount}</p>
          <p className="text-xs text-brand-500 mt-0.5">Adresse{addressCount > 1 ? "s" : ""}</p>
        </Link>

        <Link href="/wishlist" className="card p-5 hover:border-accent/30 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 grid place-items-center">
              <Heart className="h-5 w-5 text-rose-500" />
            </div>
            <ChevronRight className="h-4 w-4 text-brand-300 group-hover:text-accent transition-colors" />
          </div>
          <p className="text-2xl font-black text-brand-950">—</p>
          <p className="text-xs text-brand-500 mt-0.5">Favoris</p>
        </Link>
      </div>

      {/* Actions rapides */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-brand-950 mb-4">Actions rapides</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link href="/catalogue" className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-3 hover:border-accent/30 hover:bg-accent/5 transition-all">
            <ShoppingBag className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-950">Continuer mes achats</p>
              <p className="text-xs text-brand-500">Découvrir les nouveautés</p>
            </div>
          </Link>
          <Link href="/compte/commandes" className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-3 hover:border-accent/30 hover:bg-accent/5 transition-all">
            <Package className="h-5 w-5 text-accent shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-950">Suivre mes commandes</p>
              <p className="text-xs text-brand-500">{pendingCount > 0 ? `${pendingCount} commande${pendingCount > 1 ? "s" : ""} en cours` : "Historique complet"}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
