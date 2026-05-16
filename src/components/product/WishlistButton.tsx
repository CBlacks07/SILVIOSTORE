"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";

export function WishlistButton({ productId }: { productId: string }) {
  const toggle = useWishlist((s) => s.toggle);
  const active = useWishlist((s) => s.items.includes(productId));
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        zIndex: 20,
        width: "28px",
        height: "28px",
        borderRadius: "999px",
        background: active ? "#d97706" : "rgba(255,255,255,0.88)",
        border: active ? "none" : "1px solid rgba(217,119,6,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 1px 6px rgba(0,0,0,0.14)",
        transition: "background 0.2s ease, transform 0.15s ease",
        backdropFilter: "blur(4px)",
      }}
    >
      <Heart
        size={12}
        fill={active ? "#fff" : "none"}
        color={active ? "#fff" : "#d97706"}
        strokeWidth={2.5}
      />
    </button>
  );
}
