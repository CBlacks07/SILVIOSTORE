"use client";
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Retour en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        bottom: "88px",
        right: "20px",
        zIndex: 490,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #d97706, #b45309)",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(217,119,6,0.40)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(217,119,6,0.50)";
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(217,119,6,0.40)";
      }}
    >
      <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
