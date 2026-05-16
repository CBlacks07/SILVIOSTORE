export const dynamic = "force-dynamic";

import { sql } from "@/lib/db";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, XCircle, ShoppingCart } from "lucide-react";
import { QuickAddButton } from "@/components/product/QuickAddButton";
import type { Product } from "@/lib/types";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const ids = (searchParams.ids || "").split(",").filter(Boolean).slice(0, 3);

  if (ids.length < 2) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-brand-500">Sélectionnez au moins 2 produits à comparer.</p>
        <Link href="/catalogue" className="btn-primary mt-6 inline-flex">Voir le catalogue</Link>
      </div>
    );
  }

  const products = await sql<Product[]>`
    SELECT * FROM products WHERE id = ANY(${sql.array(ids)}) AND is_active = true
  `;

  const fields = [
    { key: "price", label: "Prix", render: (p: Product) => <strong style={{ color: "#d97706", fontSize: "18px", fontWeight: 800 }}>{formatPrice(p.price)}</strong> },
    { key: "brand", label: "Marque", render: (p: Product) => p.brand || "—" },
    { key: "stock", label: "Disponibilité", render: (p: Product) => p.stock > 0
      ? <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#16a34a" }}><CheckCircle2 size={16} /> En stock</span>
      : <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#dc2626" }}><XCircle size={16} /> Rupture</span>
    },
    { key: "sku", label: "SKU", render: (p: Product) => p.sku || "—" },
    { key: "description", label: "Description", render: (p: Product) => <span style={{ fontSize: "13px", lineHeight: 1.5 }}>{p.description || "—"}</span> },
  ];

  return (
    <div className="container-page py-10 pb-24">
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mb-2">Comparateur</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-950">Comparer les produits</h1>
      </div>

      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
          {/* Product headers */}
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", textAlign: "left", width: "160px", background: "transparent" }}></th>
              {products.map((p) => (
                <th key={p.id} style={{ padding: "0 12px 16px", verticalAlign: "top" }}>
                  <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid rgba(217,119,6,0.18)", overflow: "hidden" }}>
                    <div style={{ height: "180px", background: "rgb(248,248,250)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "12px" }} />
                        : <span style={{ fontSize: "11px", color: "#9ca3af" }}>Aucune image</span>
                      }
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a1008", margin: 0, lineHeight: 1.3 }}>{p.name}</p>
                      <Link href={"/produit/" + p.slug} style={{ fontSize: "11px", color: "#d97706", textDecoration: "none", display: "block", marginTop: "4px" }}>Voir le produit →</Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Comparison rows */}
          <tbody>
            {fields.map((field, fi) => (
              <tr key={field.key} style={{ background: fi % 2 === 0 ? "rgba(217,119,6,0.03)" : "transparent" }}>
                <td style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", borderRight: "1px solid #f3f4f6" }}>
                  {field.label}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: "14px 12px", fontSize: "14px", color: "#1a1008", textAlign: "center", borderRight: "1px solid #f3f4f6" }}>
                    {field.render(p)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Add to cart row */}
            <tr>
              <td style={{ padding: "16px" }}></td>
              {products.map((p) => (
                <td key={p.id} style={{ padding: "12px" }}>
                  <QuickAddButton product={p} className="btn-accent w-full text-sm" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
