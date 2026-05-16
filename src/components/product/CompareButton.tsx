"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows } from "lucide-react";
import { useCompare } from "@/store/compare";

export function CompareButton({ productId, productName }: { productId: string; productName: string }) {
  const toggle = useCompare((s) => s.toggle);
  const active = useCompare((s) => !!s.items.find(i => i.id === productId));
  const count = useCompare((s) => s.items.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle({ id: productId, name: productName }); }}
      title={active ? "Retirer de la comparaison" : count >= 3 ? "Max 3 produits" : "Comparer ce produit"}
      style={{
        background: active ? "rgba(217,119,6,0.12)" : "rgba(255,255,255,0.88)",
        border: `1.5px solid ${active ? "#d97706" : "rgba(217,119,6,0.20)"}`,
        borderRadius: "8px",
        padding: "6px 10px",
        cursor: count >= 3 && !active ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", gap: "5px",
        fontSize: "11px", fontWeight: 600,
        color: active ? "#d97706" : "#6b7280",
        opacity: count >= 3 && !active ? 0.5 : 1,
        transition: "all 0.15s ease",
      }}
    >
      <GitCompareArrows size={13} />
      {active ? "Comparé" : "Comparer"}
    </button>
  );
}
