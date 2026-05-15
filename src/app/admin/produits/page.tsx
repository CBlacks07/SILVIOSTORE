import Link from "next/link";
import Image from "next/image";
import { Eye, Pencil, Plus } from "lucide-react";
import { sql } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  brand: string | null;
  category_name: string | null;
};

type Counts = {
  total: number;
  active: number;
  draft: number;
  low_stock: number;
  featured: number;
};

const STOCK_THRESHOLD = 10;

function stockBar(stock: number) {
  const pct = Math.min(100, (stock / 30) * 100);
  const color =
    stock === 0 ? "#ef4444" : stock < STOCK_THRESHOLD ? "#f59e0b" : "#22c55e";
  return { pct, color };
}

const TABS = [
  { key: "all",       label: "Tous",        countKey: "total"      },
  { key: "active",    label: "Actifs",      countKey: "active"     },
  { key: "draft",     label: "Brouillons",  countKey: "draft"      },
  { key: "low_stock", label: "Stock faible",countKey: "low_stock"  },
  { key: "featured",  label: "En vedette",  countKey: "featured"   },
] as const;

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab || "all";

  const [counts] = await sql<Counts[]>`
    select
      count(*)::int                                    as total,
      count(*) filter (where is_active = true)::int    as active,
      count(*) filter (where is_active = false)::int   as draft,
      count(*) filter (where stock < ${STOCK_THRESHOLD})::int as low_stock,
      count(*) filter (where is_featured = true)::int  as featured
    from products
  `;

  const whereClause =
    tab === "active"    ? sql`where p.is_active = true` :
    tab === "draft"     ? sql`where p.is_active = false` :
    tab === "low_stock" ? sql`where p.stock < ${STOCK_THRESHOLD}` :
    tab === "featured"  ? sql`where p.is_featured = true` :
    sql``;

  const products = await sql<Row[]>`
    select
      p.id, p.slug, p.name, p.sku,
      p.price, p.stock, p.is_active, p.is_featured, p.images, p.brand,
      c.name as category_name
    from products p
    left join categories c on c.id = p.category_id
    ${whereClause}
    order by p.created_at desc
  `;

  return (
    <>
      {/* Topbar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
              <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Catalogue</span>
            </div>
            <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Catalogue produits</h1>
          </div>
          <Link href="/admin/produits/nouveau" className="btn-accent shrink-0 text-sm">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nouveau produit</span><span className="sm:hidden">Nouveau</span>
          </Link>
        </div>
      </header>

      <div className="px-4 py-4 md:px-8 md:py-6 space-y-4">
        {/* Filter tabs — scrollable on mobile */}
        <div className="flex items-center gap-1 border-b border-brand-100 overflow-x-auto pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map((t) => {
            const count = counts?.[t.countKey as keyof Counts] ?? 0;
            const active = tab === t.key;
            return (
              <Link
                key={t.key}
                href={t.key === "all" ? "/admin/produits" : `/admin/produits?tab=${t.key}`}
                className={
                  "inline-flex items-center gap-1.5 px-3 py-2.5 text-xs md:text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap " +
                  (active
                    ? "border-accent text-brand-950"
                    : "border-transparent text-brand-500 hover:text-brand-900")
                }
              >
                {t.label}
                <span className={"rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none " +
                  (active ? "bg-accent text-white" : "bg-brand-100 text-brand-600")}>
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-xl border border-brand-100 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-brand-100 bg-brand-50/60">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500 w-[40%]">Produit</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500">Marque · Catégorie</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500 text-right">Prix</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500 w-32">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500">Statut</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-brand-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {products.map((p) => {
                const { pct, color } = stockBar(p.stock);
                return (
                  <tr key={p.id} className="hover:bg-brand-50/40 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-lg bg-brand-50 overflow-hidden border border-brand-100 shrink-0">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} width={44} height={44} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-brand-100" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-brand-950 truncate">{p.name}</p>
                          <p className="text-xs text-brand-400 mt-0.5">{p.sku ? `SKU-${p.sku}` : "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-brand-900 font-medium">{p.brand || "—"}</p>
                      {p.category_name && <p className="text-xs text-brand-500 mt-0.5">{p.category_name}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-brand-950">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-brand-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                        <span
                          className="text-sm font-bold w-6 text-right"
                          style={{ color: p.stock === 0 ? "#ef4444" : p.stock < STOCK_THRESHOLD ? "#d97706" : "#374151" }}
                        >
                          {p.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.is_featured && (
                        <span className="badge bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wide mr-1.5">
                          Vedette
                        </span>
                      )}
                      <span className={
                        "badge text-[11px] font-semibold " +
                        (p.is_active ? "bg-green-100 text-green-800" : "bg-brand-100 text-brand-600")
                      }>
                        {p.is_active ? "Actif" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/produit/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-brand-400 hover:text-brand-900 hover:bg-brand-100 rounded transition-colors"
                          title="Voir"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/produits/${p.id}`}
                          className="p-1.5 text-brand-400 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-sm text-brand-400">
                    Aucun produit dans cet onglet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {products.length > 0 && (
            <div className="px-5 py-3 border-t border-brand-50 text-xs text-brand-400">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {products.map((p) => {
            const { color } = stockBar(p.stock);
            return (
              <div key={p.id} className="card p-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-brand-50 overflow-hidden border border-brand-100 shrink-0">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} width={48} height={48} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-brand-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brand-950 truncate text-sm">{p.name}</p>
                    <p className="text-xs text-brand-500 mt-0.5">{p.brand || "—"} {p.category_name ? `· ${p.category_name}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/produit/${p.slug}`}
                      target="_blank"
                      className="p-1.5 text-brand-400 hover:text-brand-900 hover:bg-brand-100 rounded transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="p-1.5 text-brand-400 hover:text-accent hover:bg-accent/10 rounded transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-50">
                  <span className="font-semibold text-brand-950 text-sm">{formatPrice(p.price)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color }}>{p.stock} en stock</span>
                    <span className={
                      "badge text-[10px] font-semibold " +
                      (p.is_active ? "bg-green-100 text-green-800" : "bg-brand-100 text-brand-600")
                    }>
                      {p.is_active ? "Actif" : "Brouillon"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <div className="card px-5 py-14 text-center text-sm text-brand-400">
              Aucun produit dans cet onglet.
            </div>
          )}
          {products.length > 0 && (
            <p className="text-xs text-brand-400 text-center py-2">
              {products.length} produit{products.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
