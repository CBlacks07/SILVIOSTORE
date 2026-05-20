"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartToast() {
  const items = useCart((s) => s.items);
  const [toast, setToast] = useState<{ name: string; price: number; image: string | null } | null>(null);
  const [visible, setVisible] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    const total = items.reduce((s, i) => s + i.quantity, 0);
    if (total > prevCount && items.length > 0) {
      const last = items[items.length - 1];
      setToast({ name: last.name, price: last.unitPrice, image: last.image });
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3500);
      setPrevCount(total);
      return () => clearTimeout(t);
    }
    setPrevCount(total);
  }, [items]);

  if (!toast) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "88px",
        right: "20px",
        zIndex: 9993,
        maxWidth: "300px",
        width: "calc(100vw - 40px)",
        transform: visible ? "translateY(0)" : "translateY(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid rgba(217,119,6,0.20)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        {/* Image ou icône */}
        <div style={{ width: "44px", height: "44px", borderRadius: "10px", overflow: "hidden", background: "rgb(248,248,250)", flexShrink: 0 }}>
          {toast.image
            ? <img src={toast.image} alt={toast.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingBag size={18} color="#d97706" />
              </div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", margin: "0 0 2px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>✓</span> Ajouté au panier
          </p>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "#1a1008", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {toast.name}
          </p>
          <p style={{ fontSize: "11px", color: "#d97706", fontWeight: 700, margin: "2px 0 0" }}>
            {formatPrice(toast.price)}
          </p>
        </div>

        {/* Fermer */}
        <button
          onClick={() => setVisible(false)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, flexShrink: 0 }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
