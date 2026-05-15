"use client";

import { useState, useEffect } from "react";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import type { MarketingSettings } from "@/lib/types";

type Props = { config: MarketingSettings["cart_reminder"] };
const STORAGE_KEY = "silvio_cart_reminder_shown";

export function CartReminderPopup({ config }: Props) {
  const { items, open } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    if (!localStorage.getItem("silvio-cart") || items.length === 0) return;
    const t = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, (config.delay_seconds ?? 5) * 1000);
    return () => clearTimeout(t);
  }, [items, config.delay_seconds]);

  if (!visible || items.length === 0) return null;

  const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const first = items[0];

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9992, maxWidth: "320px", width: "calc(100vw - 40px)", animation: "slideUp 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1008,#2c1c06)", border: "1px solid rgba(217,119,6,0.35)", borderRadius: "16px", padding: "20px", boxShadow: "0 16px 48px rgba(0,0,0,0.40)", position: "relative" }}>
        <button onClick={() => setVisible(false)} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "999px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
          <X size={14} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{ width: "36px", height: "36px", background: "rgba(217,119,6,0.20)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShoppingBag size={18} color="#d97706" />
          </div>
          <div>
            <p style={{ fontSize: "12px", fontWeight: 800, color: "#d97706", margin: 0 }}>Votre panier vous attend</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.50)", margin: 0 }}>{items.length} article{items.length > 1 ? "s" : ""} — {formatPrice(total)}</p>
          </div>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(253,230,138,0.85)", marginBottom: "14px", lineHeight: 1.5 }}>
          <strong style={{ color: "#fff" }}>{first.name}</strong>{items.length > 1 ? ` et ${items.length - 1} autre${items.length > 2 ? "s" : ""}` : ""} attendent dans votre panier.
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => { setVisible(false); open(); }} style={{ flex: 1, background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            Voir mon panier <ArrowRight size={14} />
          </button>
          <Link href="/checkout" onClick={() => setVisible(false)} style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
            Commander
          </Link>
        </div>
      </div>
    </div>
  );
}
