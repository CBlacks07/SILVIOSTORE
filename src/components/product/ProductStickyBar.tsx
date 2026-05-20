"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductStickyBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? null,
      unitPrice: product.price,
      quantity: 1,
      variantLabel: ""
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(217,119,6,0.15)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.10)",
        paddingBottom: "env(safe-area-inset-bottom)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
      }}
      className="lg:hidden"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px" }}>
        {/* Product image */}
        {product.images?.[0] && (
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", overflow: "hidden", background: "rgb(248,248,250)", flexShrink: 0 }}>
            <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</p>
          <p style={{ fontSize: "16px", fontWeight: 800, color: "#1a1008", margin: 0 }}>{formatPrice(product.price)}</p>
        </div>
        <button type="button" disabled={outOfStock} onClick={handleAdd}
          style={{
            background: added ? "linear-gradient(135deg,#16a34a,#22c55e)" : "linear-gradient(135deg,#d97706,#f59e0b)",
            color: "#fff", border: "none", borderRadius: "999px",
            padding: "13px 28px", fontSize: "14px", fontWeight: 700,
            cursor: outOfStock ? "not-allowed" : "pointer",
            flexShrink: 0, display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 4px 16px rgba(217,119,6,0.35)",
            transition: "all 0.25s ease",
            opacity: outOfStock ? 0.5 : 1,
          }}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Ajouté
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {outOfStock ? "Indisponible" : "Ajouter"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
