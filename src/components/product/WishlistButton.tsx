"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";

export function WishlistButton({ productId }: { productId: string }) {
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const active = has(productId);

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
        left: "8px",
        zIndex: 20,
        width: "32px",
        height: "32px",
        borderRadius: "999px",
        background: active ? "#d97706" : "rgba(255,255,255,0.90)",
        border: active ? "none" : "1px solid rgba(0,0,0,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        transition: "background 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Heart
        size={14}
        fill={active ? "#fff" : "none"}
        color={active ? "#fff" : "#d97706"}
        strokeWidth={2}
      />
    </button>
  );
}
