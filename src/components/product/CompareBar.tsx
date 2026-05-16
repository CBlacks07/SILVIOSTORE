"use client";

import { useEffect, useState } from "react";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare } from "@/store/compare";

export function CompareBar() {
  const { ids, remove, clear } = useCompare();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || ids.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: "80px", left: "50%", transform: "translateX(-50%)",
      zIndex: 9990,
      background: "linear-gradient(135deg, #1a1008, #2c1c06)",
      border: "1px solid rgba(217,119,6,0.35)",
      borderRadius: "14px",
      padding: "12px 16px",
      display: "flex", alignItems: "center", gap: "12px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
      animation: "slideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
      maxWidth: "calc(100vw - 32px)",
      flexWrap: "wrap",
    }}>
      <GitCompareArrows size={16} color="#d97706" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", flexShrink: 0 }}>
        {ids.length}/3 produits
      </span>
      <div style={{ display: "flex", gap: "6px", flex: 1, minWidth: 0 }}>
        {ids.map((id) => (
          <div key={id} style={{ background: "rgba(255,255,255,0.10)", borderRadius: "6px", padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "11px", color: "rgba(253,230,138,0.80)", fontFamily: "monospace", maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{id.slice(0, 6)}…</span>
            <button type="button" onClick={() => remove(id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", padding: 0 }}>
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
      {ids.length >= 2 && (
        <a
          href={"/comparer?ids=" + ids.join(",")}
          style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", borderRadius: "8px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap", textDecoration: "none", display: "inline-flex", alignItems: "center" }}
        >
          Comparer
        </a>
      )}
      <button type="button" onClick={clear} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
        <X size={16} />
      </button>
    </div>
  );
}
