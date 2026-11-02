"use client";

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

const ROTATIONS = [-3, 2, -2, 3, -1.5, 2.5, -3, 1.5, -2.5, 3];

export function SelectionStrip({ products }: { products: Product[] }) {
  // Duplicate for seamless infinite loop
  const items = [...products, ...products];

  return (
    <div style={{ position: "relative", paddingTop: "32px", paddingBottom: "40px" }}>
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, rgb(250,248,245), transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, rgb(250,248,245), transparent)", zIndex: 2, pointerEvents: "none" }} />

      <style>{`
        @keyframes strip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .strip-wrap {
          overflow: hidden;
        }
        .strip-track {
          display: flex;
          gap: 20px;
          padding: 8px 40px;
          width: max-content;
          animation: strip-scroll 40s linear infinite;
          will-change: transform;
        }
        .strip-wrap:hover .strip-track {
          animation-play-state: paused;
        }
        .strip-card {
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease;
          flex-shrink: 0;
        }
        .strip-card:hover {
          transform: rotate(0deg) scale(1.07) translateY(-10px) !important;
          z-index: 10;
          box-shadow: 0 20px 48px rgba(0,0,0,0.22) !important;
        }
        .strip-card:hover .strip-overlay { opacity: 1 !important; }
        @media (prefers-reduced-motion: reduce) {
          .strip-track { animation: none; }
        }
      `}</style>

      <div className="strip-wrap">
        <div className="strip-track">
          {items.map((p, i) => {
            const rot = ROTATIONS[i % ROTATIONS.length];
            const img = p.images?.[0];
            const discount = p.compare_at_price && p.compare_at_price > p.price
              ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100)
              : null;

            return (
              <Link
                key={p.id + "-" + i}
                href={"/produit/" + p.slug}
                className="strip-card"
                draggable={false}
                style={{
                  transform: `rotate(${rot}deg)`,
                  display: "block",
                  textDecoration: "none",
                  width: "clamp(155px, 17vw, 210px)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                  position: "relative",
                }}
              >
                <div style={{ height: "clamp(190px, 21vw, 270px)", background: "rgb(248,248,250)", overflow: "hidden", position: "relative" }}>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#9ca3af" }}>
                      Aucune image
                    </div>
                  )}
                  {discount && (
                    <span style={{ position: "absolute", top: "10px", left: "10px", background: "#d97706", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "3px 8px", borderRadius: "999px" }}>
                      -{discount}%
                    </span>
                  )}
                </div>

                {/* Hover info overlay */}
                <div className="strip-overlay" style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(26,16,8,0.93) 0%, rgba(26,16,8,0.60) 60%, transparent 100%)",
                  padding: "24px 14px 56px",
                  opacity: 0,
                  transition: "opacity 0.28s ease",
                  pointerEvents: "none",
                }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#fff", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#d97706", margin: 0 }}>{formatPrice(p.price)}</p>
                </div>

                {/* Bottom label */}
                <div style={{ background: "#fff", padding: "10px 14px" }}>
                  <p style={{ fontSize: "10px", color: "#9ca3af", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                    {p.brand || "SILVIO STORE"}
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 800, color: "#1a1008", margin: 0 }}>{formatPrice(p.price)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
