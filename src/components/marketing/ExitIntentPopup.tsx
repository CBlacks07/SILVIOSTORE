"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "silvio_exit_shown";

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem(STORAGE_KEY);
    if (shown) return;

    // Desktop: detect mouse leaving top of page
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 8) trigger();
    }

    // Mobile: detect fast scroll up (back to top gesture)
    let lastY = window.scrollY;
    let lastTime = Date.now();
    function handleScroll() {
      const y = window.scrollY;
      const now = Date.now();
      const velocity = (lastY - y) / (now - lastTime);
      if (velocity > 2.5 && y < 200) trigger();
      lastY = y;
      lastTime = now;
    }

    // Only trigger after 15s on page
    let armed = false;
    const arm = setTimeout(() => {
      armed = true;
      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 15000);

    function trigger() {
      if (!armed) return;
      setVisible(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    }

    return () => {
      clearTimeout(arm);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function close() { setVisible(false); }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99991,
        background: "rgba(0,0,0,0.70)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.25s ease",
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 60%, #1a1008 100%)",
          borderRadius: "20px",
          border: "1px solid rgba(217,119,6,0.35)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
          maxWidth: "440px", width: "100%",
          padding: "40px 32px",
          position: "relative",
          textAlign: "center",
          animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: "20px", background: "radial-gradient(ellipse at 50% 0%, rgba(217,119,6,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />

        <button onClick={close} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "999px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
          <X size={16} />
        </button>

        <p style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</p>

        <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", color: "#d97706", marginBottom: "12px" }}>
          Attendez !
        </p>
        <h2 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "clamp(20px,5vw,26px)", fontWeight: 700, color: "#fff", lineHeight: 1.25, margin: "0 0 12px" }}>
          Vous partez sans votre accessoire ?
        </h2>
        <p style={{ fontSize: "14px", color: "rgba(253,230,138,0.80)", lineHeight: 1.6, marginBottom: "28px" }}>
          Découvrez notre sélection premium livrée partout dans la sous région. Paiement Mobile Money accepté.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link
            href="/catalogue"
            onClick={close}
            style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)", color: "#fff", borderRadius: "10px", padding: "14px 24px", fontSize: "14px", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            Voir le catalogue <ArrowRight size={16} />
          </Link>
          <button
            onClick={close}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.50)", borderRadius: "10px", padding: "12px", fontSize: "13px", cursor: "pointer" }}
          >
            Non merci, je pars quand même
          </button>
        </div>
      </div>
    </div>
  );
}
