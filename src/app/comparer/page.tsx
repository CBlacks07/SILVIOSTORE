export const dynamic = "force-dynamic";

import { sql } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, XCircle, X } from "lucide-react";
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

  let products: Product[] = [];
  try {
    if (ids.length > 0) {
      // Fetch each product individually to avoid sql.array() issues
      const results = await Promise.all(
        ids.map((id) =>
          sql<Product[]>`SELECT * FROM products WHERE id = ${id} AND is_active = true LIMIT 1`
        )
      );
      products = results.flat().filter(Boolean);
    }
  } catch (e) {
    console.error("comparer query error:", e);
  }

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

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0", minWidth: "500px", tableLayout: "fixed" }}>
          {/* Product headers */}
          <thead>
            <tr>
              <th style={{ width: "120px" }} />
              {products.map((p) => (
                <th key={p.id} style={{ padding: "0 10px 24px", verticalAlign: "top" }}>
                  <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid rgba(217,119,6,0.20)", overflow: "hidden", boxShadow: "0 4px 24px rgba(217,119,6,0.08), 0 1px 4px rgba(0,0,0,0.06)", position: "relative" }}>
                    {/* Bouton retirer */}
                    <Link
                      href={"/comparer?ids=" + ids.filter(id => id !== p.id).join(",")}
                      style={{ position: "absolute", top: "8px", right: "8px", zIndex: 10, width: "28px", height: "28px", borderRadius: "999px", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", textDecoration: "none" }}
                      title="Retirer ce produit"
                    >
                      <X size={14} color="#6b7280" />
                    </Link>

                    <div style={{ height: "200px", background: "linear-gradient(145deg, #faf8f5, #f5f2ed)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", borderBottom: "1px solid rgba(217,119,6,0.08)", position: "relative" }}>
                      {p.images?.[0] ? (
                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                          <Image src={p.images[0]} alt={p.name} fill style={{ objectFit: "contain" }} sizes="200px" />
                        </div>
                      ) : <span style={{ fontSize: "11px", color: "#9ca3af" }}>Aucune image</span>}
                    </div>
                    <div style={{ padding: "16px 16px 18px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#1a1008", margin: "0 0 4px", lineHeight: 1.3, textAlign: "center" }}>{p.name}</p>
                      <div style={{ textAlign: "center" }}>
                        <Link href={"/produit/" + p.slug} style={{ fontSize: "11px", color: "#d97706", textDecoration: "none", fontWeight: 700 }}>Voir le produit →</Link>
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Comparison rows */}
          <tbody>
            {fields.map((field, fi) => (
              <tr key={field.key}>
                <td style={{ padding: "12px 8px 12px 0", fontSize: "10px", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", whiteSpace: "nowrap", borderTop: "1px solid #f3f4f6" }}>
                  {field.label}
                </td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: "12px 8px", fontSize: "13px", color: "#1a1008", textAlign: "center", borderTop: "1px solid #f3f4f6", background: fi % 2 === 0 ? "rgba(217,119,6,0.02)" : "transparent" }}>
                    {field.render(p)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Add to cart row */}
            <tr>
              <td style={{ borderTop: "1px solid #f3f4f6", padding: "16px 8px 0 0" }} />
              {products.map((p) => (
                <td key={p.id} style={{ padding: "16px 8px 0", borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
                  <QuickAddButton product={p} className="btn-accent" />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
