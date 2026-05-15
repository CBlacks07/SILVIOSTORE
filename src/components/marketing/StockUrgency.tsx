"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

export function StockUrgency({ stock }: { stock: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (stock > 0 && stock <= 5) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, [stock]);

  if (!visible) return null;

  const isLast = stock === 1;
  const isCritical = stock <= 2;

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: "10px",
        background: isCritical ? "rgba(220,38,38,0.10)" : "rgba(217,119,6,0.10)",
        border: `1px solid ${isCritical ? "rgba(220,38,38,0.30)" : "rgba(217,119,6,0.30)"}`,
        borderRadius: "10px",
        padding: "10px 14px",
        animation: "urgencyPulse 2s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes urgencyPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>
      <Flame size={16} color={isCritical ? "#dc2626" : "#d97706"} style={{ flexShrink: 0 }} />
      <p style={{ fontSize: "13px", fontWeight: 600, color: isCritical ? "#dc2626" : "#92400e", margin: 0 }}>
        {isLast
          ? "Dernier article en stock — commandez maintenant !"
          : `Plus que ${stock} en stock — ne tardez pas !`}
      </p>
    </div>
  );
}
