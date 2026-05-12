"use client";

import { useState, useEffect } from "react";
import { SITE } from "@/lib/constants";

const WA_NUMBER = SITE.contact.phone.replace(/\D/g, "");
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Bonjour SILVIO STORE, j'ai une question.")}`;

export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "10px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            background: "#121826",
            color: "#fff",
            fontSize: "12px",
            fontFamily: "var(--font-roboto), Roboto, sans-serif",
            padding: "8px 14px",
            borderRadius: "8px",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            animation: "fade-in 0.2s ease",
          }}
        >
          Discuter sur WhatsApp
          <div style={{
            position: "absolute",
            right: "20px",
            bottom: "-5px",
            width: "10px",
            height: "10px",
            background: "#121826",
            transform: "rotate(45deg)",
            borderRadius: "2px",
          }} />
        </div>
      )}

      {/* Button */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter sur WhatsApp"
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "999px",
          background: "#16a34a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(22,163,74,0.45)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          textDecoration: "none",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 28px rgba(22,163,74,0.55)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(22,163,74,0.45)";
        }}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white" aria-hidden>
          <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.67 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.15-3.41-8.43zM12.06 21.6h-.01a9.72 9.72 0 0 1-4.96-1.36l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.7 9.7 0 0 1-1.48-5.14c0-5.36 4.36-9.73 9.73-9.73a9.67 9.67 0 0 1 6.88 2.85 9.65 9.65 0 0 1 2.85 6.88c0 5.37-4.36 9.73-9.72 9.73zm5.34-7.29c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.15-.17.2-.34.22-.64.07-.29-.15-1.24-.46-2.37-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.03-.51-.07-.15-.66-1.58-.9-2.17-.24-.58-.49-.5-.66-.5l-.56-.01c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43 0 1.43 1.05 2.82 1.2 3.01.15.2 2.07 3.17 5.01 4.44.7.3 1.25.49 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.74-.71 1.98-1.4.24-.69.24-1.27.17-1.4-.07-.12-.27-.2-.56-.34z" />
        </svg>

        {/* Pulse ring */}
        <span style={{
          position: "absolute",
          width: "56px",
          height: "56px",
          borderRadius: "999px",
          border: "2px solid rgba(22,163,74,0.4)",
          animation: "wa-pulse 2s ease-out infinite",
          pointerEvents: "none",
        }} />
      </a>

      <style>{`
        @keyframes wa-pulse {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1.7); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
