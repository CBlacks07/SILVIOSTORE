"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Product = { slug: string; name: string; brand: string | null; price: number; images: string[] };
type Category = { slug: string; name: string };

export function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Debounced fetch
  useEffect(() => {
    if (q.trim().length < 2) {
      setProducts([]); setCategories([]); setLoading(false); return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/search/suggest?q=" + encodeURIComponent(q.trim()));
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        if ((data.products?.length || data.categories?.length)) {
          setOpen(true);
          if (wrapRef.current) setRect(wrapRef.current.getBoundingClientRect());
        }
      } catch {}
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        const drop = document.getElementById("search-drop");
        if (drop && drop.contains(e.target as Node)) return;
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function close() { setOpen(false); setQ(""); setProducts([]); setCategories([]); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) { router.push("/catalogue?q=" + encodeURIComponent(q.trim())); close(); }
  }

  const hasResults = products.length > 0 || categories.length > 0;

  return (
    <>
      <div ref={wrapRef} style={{ width: "100%", position: "relative" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", height: "42px", borderRadius: "999px", background: "#fff", overflow: "hidden", border: "2px solid transparent" }}>
          <span style={{ display: "flex", alignItems: "center", padding: "0 10px 0 14px", color: "#9ca3af", flexShrink: 0 }}>
            {loading ? <Loader2 size={15} style={{ color: "#d97706", animation: "spin 0.8s linear infinite" }} /> : <Search size={15} />}
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => { if (hasResults && wrapRef.current) { setRect(wrapRef.current.getBoundingClientRect()); setOpen(true); }}}
            onKeyDown={(e) => { if (e.key === "Escape") close(); }}
            placeholder="Rechercher un produit..."
            autoComplete="off"
            style={{ flex: 1, minWidth: "60px", background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "#1a1008", padding: "0 4px" }}
          />
          {q && (
            <button type="button" onClick={close} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 6px", color: "#9ca3af", display: "flex", alignItems: "center" }}>
              <X size={13} />
            </button>
          )}
          <button type="submit" style={{ background: "#d97706", color: "#fff", border: "none", height: "100%", padding: "0 18px", fontSize: "11px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}>
            Chercher
          </button>
        </form>
      </div>

      {/* Portal dropdown — outside any overflow:hidden container */}
      {mounted && open && hasResults && rect && createPortal(
        <div
          id="search-drop"
          style={{
            position: "fixed",
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
            zIndex: 999999,
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 12px 48px rgba(0,0,0,0.22)",
            border: "1px solid rgba(217,119,6,0.18)",
            overflow: "hidden",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {/* Categories */}
          {categories.length > 0 && (
            <div style={{ padding: "12px 16px 10px" }}>
              <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", margin: "0 0 8px" }}>Catégories</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {categories.map((c) => (
                  <a key={c.slug} href={"/catalogue?categorie=" + c.slug} onClick={close}
                    style={{ padding: "4px 12px", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.20)", borderRadius: "999px", fontSize: "12px", color: "#92400e", fontWeight: 600, textDecoration: "none" }}>
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {products.length > 0 && (
            <div>
              {categories.length > 0 && <div style={{ height: "1px", background: "#f3f4f6", margin: "0 16px" }} />}
              <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", padding: "10px 16px 4px", margin: 0 }}>Produits</p>
              {products.map((p) => (
                <a key={p.slug} href={"/produit/" + p.slug} onClick={close}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 16px", textDecoration: "none", background: "transparent", transition: "background 0.1s" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "rgba(217,119,6,0.05)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: "44px", height: "44px", borderRadius: "8px", overflow: "hidden", background: "#f5f3f0", flexShrink: 0 }}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Search size={16} color="#d1d5db" /></div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1008", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                    {p.brand && <p style={{ fontSize: "10px", color: "#9ca3af", margin: "1px 0 0" }}>{p.brand}</p>}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#d97706", flexShrink: 0 }}>{formatPrice(p.price)}</span>
                </a>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px 16px" }}>
            <a href={"/catalogue?q=" + encodeURIComponent(q)} onClick={close}
              style={{ fontSize: "12px", color: "#d97706", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <Search size={12} /> Voir tous les résultats pour « {q} »
            </a>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
