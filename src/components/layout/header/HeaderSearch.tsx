"use client";

import { useEffect, useRef, useState } from "react";
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
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Debounced fetch
  useEffect(() => {
    if (q.trim().length < 2) { setProducts([]); setCategories([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/search/suggest?q=" + encodeURIComponent(q.trim()));
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
      } catch {}
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  // Position dropdown under input
  function updatePos() {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setDropPos({ top: r.bottom + window.scrollY + 6, left: r.left, width: r.width });
  }

  function handleFocus() {
    setOpen(true);
    updatePos();
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    window.addEventListener("resize", updatePos);
    return () => { document.removeEventListener("mousedown", handler); window.removeEventListener("resize", updatePos); };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) { router.push("/catalogue?q=" + encodeURIComponent(q.trim())); setOpen(false); }
  }

  const hasResults = products.length > 0 || categories.length > 0;

  return (
    <>
      <div ref={wrapRef} className="w-full">
        <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", height: "42px", borderRadius: "999px", background: "#fff", border: open ? "2px solid #d97706" : "2px solid rgba(255,255,255,0.15)", transition: "border-color 0.2s ease", overflow: "hidden" }}>
          <span style={{ display: "flex", alignItems: "center", padding: "0 10px 0 14px", color: "#9ca3af", flexShrink: 0 }}>
            <Search size={16} />
          </span>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={(e) => { if (e.key === "Escape") { setOpen(false); setQ(""); inputRef.current?.blur(); } }}
            placeholder="Rechercher un produit..."
            autoComplete="off"
            style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "#1a1008", padding: "0 4px" }}
          />
          {q && (
            <button type="button" onClick={() => { setQ(""); setProducts([]); setCategories([]); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 8px", color: "#9ca3af", display: "flex" }}>
              <X size={14} />
            </button>
          )}
          {loading && <Loader2 size={14} style={{ color: "#d97706", animation: "spin 1s linear infinite", marginRight: "8px", flexShrink: 0 }} />}
          <button type="submit" style={{ background: "#d97706", color: "#fff", border: "none", height: "100%", padding: "0 18px", fontSize: "11px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
            Chercher
          </button>
        </form>
      </div>

      {/* Dropdown — portaled via fixed position */}
      {open && hasResults && dropPos && (
        <div
          style={{
            position: "fixed",
            top: dropPos.top,
            left: Math.max(8, dropPos.left),
            width: Math.min(dropPos.width, window.innerWidth - 16),
            zIndex: 99998,
            background: "#fff",
            borderRadius: "14px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
            border: "1px solid rgba(217,119,6,0.15)",
            overflow: "hidden",
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {/* Categories */}
          {categories.length > 0 && (
            <div style={{ padding: "12px 16px 8px" }}>
              <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "8px" }}>Catégories</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {categories.map((c) => (
                  <a key={c.slug} href={"/catalogue?categorie=" + c.slug} onClick={() => setOpen(false)}
                    style={{ padding: "4px 12px", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.20)", borderRadius: "999px", fontSize: "12px", color: "#92400e", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {products.length > 0 && (
            <div style={{ padding: categories.length > 0 ? "8px 0 8px" : "12px 0 8px" }}>
              {categories.length > 0 && <div style={{ height: "1px", background: "rgba(217,119,6,0.10)", margin: "0 16px 8px" }} />}
              <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af", padding: "0 16px", marginBottom: "4px" }}>Produits</p>
              {products.map((p) => (
                <a key={p.slug} href={"/produit/" + p.slug} onClick={() => { setOpen(false); setQ(""); }}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 16px", textDecoration: "none", transition: "background 0.1s" }}
                  onMouseOver={(e) => (e.currentTarget.style.background = "rgba(217,119,6,0.05)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Image */}
                  <div style={{ width: "44px", height: "44px", borderRadius: "8px", overflow: "hidden", background: "#f5f3f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <Search size={16} color="#d1d5db" />
                    }
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a1008", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                    {p.brand && <p style={{ fontSize: "10px", color: "#9ca3af", margin: "1px 0 0" }}>{p.brand}</p>}
                  </div>
                  {/* Price */}
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#d97706", flexShrink: 0 }}>{formatPrice(p.price)}</span>
                </a>
              ))}
            </div>
          )}

          {/* Footer link */}
          <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px 16px" }}>
            <a href={"/catalogue?q=" + encodeURIComponent(q)} onClick={() => setOpen(false)}
              style={{ fontSize: "12px", color: "#d97706", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <Search size={13} /> Voir tous les résultats pour « {q} »
            </a>
          </div>
        </div>
      )}
    </>
  );
}
