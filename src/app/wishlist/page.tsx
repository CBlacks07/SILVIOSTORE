"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  stock: number;
};

export default function WishlistPage() {
  const items     = useWishlist((s) => s.items);
  const hydrated  = useWishlist((s) => s._hydrated);
  const toggle    = useWishlist((s) => s.toggle);
  const sync      = useWishlist((s) => s.sync);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);

  // Attend que Zustand ait chargé le localStorage avant de fetcher
  useEffect(() => {
    if (!hydrated) return;

    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("/api/wishlist/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: items })
    })
      .then((r) => r.json())
      .then((data) => {
        const valid: Product[] = data.products || [];
        setProducts(valid);
        sync(valid.map((p) => p.id));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#121826", margin: 0 }}>
          Liste de souhaits
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "6px" }}>
          {items.length} article{items.length !== 1 ? "s" : ""} sauvegardé{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "999px", border: "3px solid #d97706", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Heart size={48} color="#d97706" style={{ opacity: 0.4, margin: "0 auto 16px" }} />
          <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>Votre liste de souhaits est vide.</p>
          <Link href="/catalogue" style={{ background: "#1a1008", color: "#fff", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <ShoppingBag size={16} /> Voir le catalogue
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {products.map((p) => {
            const cover = p.images?.[0];
            const discount = p.compare_at_price && p.compare_at_price > p.price
              ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
              : null;

            return (
              <div key={p.id} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #f3f0eb", position: "relative" }}>
                <Link href={`/produit/${p.slug}`} style={{ display: "block", textDecoration: "none" }}>
                  <div style={{ position: "relative", aspectRatio: "1/1", background: "#f9f6f1", overflow: "hidden" }}>
                    {cover ? (
                      <Image src={cover} alt={p.name} fill sizes="240px" style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4b49a", fontSize: "12px" }}>Aucune image</div>
                    )}
                    {discount && (
                      <span style={{ position: "absolute", top: "8px", right: "8px", background: "#d97706", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "999px" }}>-{discount}%</span>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    {p.brand && <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#a3752c", marginBottom: "4px" }}>{p.brand}</p>}
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#121826", margin: "0 0 8px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 800, color: "#121826" }}>{formatPrice(p.price)}</span>
                      {p.compare_at_price && p.compare_at_price > p.price && (
                        <span style={{ fontSize: "11px", color: "#a3a3a3", textDecoration: "line-through" }}>{formatPrice(p.compare_at_price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => toggle(p.id)}
                  title="Retirer de la liste"
                  style={{ position: "absolute", top: "8px", left: "8px", width: "30px", height: "30px", borderRadius: "999px", background: "rgba(217,119,6,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  <Heart size={14} fill="#d97706" color="#d97706" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
