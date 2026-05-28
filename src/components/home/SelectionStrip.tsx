"use client";

import { useRef, useEffect, useState, useCallback } from "react";
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
const SPEED = 0.7; // px per frame

export function SelectionStrip({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollStart = useRef(0);

  // Duplicate for seamless loop
  const items = [...products, ...products];

  const visibleRef = useRef(false);

  const tick = useCallback(() => {
    const el = trackRef.current;
    if (el && !pausedRef.current && visibleRef.current) {
      el.scrollLeft += SPEED;
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(el);
    rafRef.current = requestAnimationFrame(tick);
    return () => { observer.disconnect(); cancelAnimationFrame(rafRef.current); };
  }, [tick]);

  // Mouse drag handlers
  const onMouseEnter = () => { pausedRef.current = true; };
  const onMouseLeave = () => {
    if (!dragging.current) pausedRef.current = false;
  };
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragScrollStart.current = trackRef.current?.scrollLeft ?? 0;
    pausedRef.current = true;
    if (trackRef.current) trackRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStartX.current;
    if (trackRef.current) trackRef.current.scrollLeft = dragScrollStart.current - dx;
  };
  const onMouseUp = () => {
    dragging.current = false;
    pausedRef.current = false;
    if (trackRef.current) trackRef.current.style.cursor = "grab";
  };

  return (
    <div style={{ position: "relative", paddingTop: "32px", paddingBottom: "40px" }}>
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, rgb(250,248,245), transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, rgb(250,248,245), transparent)", zIndex: 2, pointerEvents: "none" }} />

      <style>{`
        .strip-track {
          display: flex;
          gap: 20px;
          overflow-x: scroll;
          scroll-behavior: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          align-items: center;
          cursor: grab;
          padding: 8px 80px;
          user-select: none;
          -webkit-user-select: none;
        }
        .strip-track::-webkit-scrollbar { display: none; }
        .strip-card {
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease;
          flex-shrink: 0;
        }
        .strip-card:hover {
          transform: rotate(0deg) scale(1.06) translateY(-8px) !important;
          z-index: 10;
        }
        .strip-card:hover .strip-overlay { opacity: 1 !important; }
      `}</style>

      <div
        ref={trackRef}
        className="strip-track"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
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
              draggable={false}
              onClick={(e) => {
                // Prevent navigation if the user was dragging
                if (Math.abs(dragStartX.current - (e.clientX)) > 5) e.preventDefault();
              }}
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
