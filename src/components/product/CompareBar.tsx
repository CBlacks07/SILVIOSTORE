"use client";

import { useEffect, useState } from "react";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare } from "@/store/compare";

export function CompareBar() {
  const { items, remove, clear } = useCompare();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || items.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: "88px", left: "50%", transform: "translateX(-50%)",
      zIndex: 9990,
      background: "linear-gradient(135deg, #1a1008, #2c1c06)",
      border: "1px solid rgba(217,119,6,0.35)",
      borderRadius: "999px",
      padding: "10px 16px",
      display: "flex", alignItems: "center", gap: "10px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
      maxWidth: "calc(100vw - 32px)",
    }}>
      <GitCompareArrows size={15} color="#d97706" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: "12px", fontWeight: 600, color: "#fff", flexShrink: 0 }}>
        {items.length}/3
      </span>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {items.map((item) => (
          <span key={item.id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.10)", borderRadius: "999px", padding: "3px 10px 3px 12px", fontSize: "11px", color: "rgba(253,230,138,0.90)", fontWeight: 500, maxWidth: "120px" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
            <button type="button" onClick={() => remove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 0, flexShrink: 0 }}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      {items.length >= 2 && (
        <a href={"/comparer?ids=" + items.map(i => i.id).join(",")}
          style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", borderRadius: "999px", padding: "7px 16px", fontSize: "12px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", flexShrink: 0, whiteSpace: "nowrap" }}>
          Comparer
        </a>
      )}
      <button type="button" onClick={clear} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", flexShrink: 0, padding: 0, display: "flex" }}>
        <X size={14} />
      </button>
    </div>
  );
}
