"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price?: number | null;
  images?: string[];
  brand?: string | null;
};

// Slight rotations for each card — alternating like BrandLyft
const ROTATIONS = [-3, 2, -2, 3, -1.5, 2.5, -3, 1.5, -2.5, 3];

export function SelectionStrip({ products }: { products: Product[] }) {
  const [paused, setPaused] = useState(false);
  const items = [...products, ...products]; // duplicate for seamless loop

  return (
    <div style={{ position: "relative", overflow: "hidden", paddingTop: "32px", paddingBottom: "40px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, rgb(250,248,245), transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, rgb(250,248,245), transparent)", zIndex: 2, pointerEvents: "none" }} />

      <style>{`
        @keyframes strip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .strip-track {
          display: flex;
          gap: 20px;
          width: max-content;
          animation: strip-scroll 35s linear infinite;
          will-change: transform;
          align-items: center;
        }
        .strip-track.paused { animation-play-state: paused; }
        .strip-card {
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease;
          cursor: pointer;
          flex-shrink: 0;
        }
        .strip-card:hover {
          transform: rotate(0deg) scale(1.06) translateY(-8px) !important;
          z-index: 10;
        }
        .strip-card:hover .strip-overlay {
          opacity: 1 !important;
        }
      `}</style>

      <div className={`strip-track${paused ? " paused" : ""}`}>
        {items.map((p, i) => {
          const rot = ROTATIONS[i % ROTATIONS.length];
          const img = p.images?.[0];
          const discount = p.compare_at_price && p.compare_at_price > p.price
            ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
            : null;

          return (
            <Link
              key={p.id + i}
              href={"/produit/" + p.slug}
              className="strip-card"
              style={{
                transform: `rotate(${rot}deg)`,
                display: "block",
                textDecoration: "none",
                width: "clamp(160px, 18vw, 220px)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                position: "relative",
              }}
            >
              {/* Image */}
              <div style={{ height: "clamp(200px, 22vw, 280px)", background: "rgb(248,248,250)", overflow: "hidden", position: "relative" }}>
                {img
                  ? <img src={img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#9ca3af" }}>Aucune image</div>
                }
                {discount && (
                  <span style={{ position: "absolute", top: "10px", left: "10px", background: "#d97706", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "999px" }}>
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Info overlay on hover */}
              <div className="strip-overlay" style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(to top, rgba(26,16,8,0.92) 0%, rgba(26,16,8,0.60) 60%, transparent 100%)",
                padding: "20px 14px 14px",
                opacity: 0,
                transition: "opacity 0.3s ease",
              }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#d97706", margin: 0 }}>{formatPrice(p.price)}</p>
              </div>

              {/* Static price bottom */}
              <div style={{ background: "#fff", padding: "10px 14px" }}>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.brand || "SILVIO STORE"}</p>
                <p style={{ fontSize: "13px", fontWeight: 800, color: "#1a1008", margin: 0 }}>{formatPrice(p.price)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
