"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingBag } from "lucide-react";
import type { MarketingSettings } from "@/lib/types";

type Proof = { buyer: string; city: string; product: string; created_at: string };
type Props = { config: MarketingSettings["social_proof"] };


function timeAgo(dateStr: string) {
  if (!dateStr) return "à l'instant";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 2) return "à l'instant";
  if (diff < 60) return `il y a ${diff} min`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}

export function SocialProofToast({ config }: Props) {
  const [items, setItems] = useState<Proof[]>([]);
  const [current, setCurrent] = useState<Proof | null>(null);
  const [visible, setVisible] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef(config.interval_seconds ?? 18);

  useEffect(() => { intervalRef.current = config.interval_seconds ?? 18; }, [config.interval_seconds]);

  useEffect(() => {
    const fallback: Proof[] = (config.fallback_items ?? []).map((f) => ({ ...f, created_at: "" }));
    fetch("/api/social-proof")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) && data.length > 0 ? data : fallback))
      .catch(() => setItems(fallback));
  }, [config.fallback_items]);

  useEffect(() => {
    if (items.length === 0) return;
    const first = setTimeout(() => showNext(), 8000);
    return () => clearTimeout(first);
  }, [items]);

  function showNext() {
    const item = items[indexRef.current % items.length];
    indexRef.current++;
    setCurrent(item);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
      setTimeout(showNext, intervalRef.current * 1000);
    }, 4500);
  }

  if (!current) return null;

  return (
    <div style={{ position: "fixed", bottom: "90px", left: "20px", zIndex: 9990, maxWidth: "300px", width: "calc(100vw - 40px)", transform: visible ? "translateY(0)" : "translateY(120%)", opacity: visible ? 1 : 0, transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1),opacity 0.4s ease", pointerEvents: "none" }}>
      <div style={{ background: "linear-gradient(135deg,#1a1008,#2c1c06)", border: "1px solid rgba(217,119,6,0.30)", borderRadius: "14px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.35)" }}>
        <div style={{ width: "40px", height: "40px", background: "rgba(217,119,6,0.20)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ShoppingBag size={18} color="#d97706" />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.3 }}>
            <span style={{ color: "#d97706" }}>{current.buyer}</span> à {current.city}
          </p>
          <p style={{ fontSize: "11px", color: "rgba(253,230,138,0.80)", margin: "2px 0 0", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            vient d&apos;acheter {current.product}
          </p>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>{timeAgo(current.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
