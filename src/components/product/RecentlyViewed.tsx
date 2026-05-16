"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type RecentProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
};

const KEY = "silvio_recently_viewed";
const MAX = 6;

export function useRecentlyViewed() {
  function add(product: RecentProduct) {
    try {
      const existing: RecentProduct[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      const filtered = existing.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch {}
  }

  function get(): RecentProduct[] {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }

  return { add, get };
}

export function RecentlyViewedTracker({ product }: { product: RecentProduct }) {
  const { add } = useRecentlyViewed();
  useEffect(() => { add(product); }, [product.id]);
  return null;
}

export function RecentlyViewedSection({ currentId }: { currentId: string }) {
  const [items, setItems] = useState<RecentProduct[]>([]);
  const { get } = useRecentlyViewed();

  useEffect(() => {
    const all = get().filter((p) => p.id !== currentId);
    setItems(all);
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="flex items-center gap-3 mb-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">Récemment consultés</p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
        {items.map((p) => (
          <Link
            key={p.id}
            href={"/produit/" + p.slug}
            className="product-card flex-shrink-0 flex flex-col bg-white rounded-xl overflow-hidden"
            style={{ width: "160px" }}
          >
            <div style={{ width: "160px", height: "160px", background: "rgb(248,248,250)", overflow: "hidden", flexShrink: 0 }}>
              {p.image
                ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#9ca3af" }}>Aucune image</div>
              }
            </div>
            <div style={{ padding: "10px 12px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a1008", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{p.name}</p>
              <p style={{ fontSize: "12px", fontWeight: 800, color: "#d97706", margin: "4px 0 0" }}>{formatPrice(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
