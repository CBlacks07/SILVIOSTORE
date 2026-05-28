"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

type Category = { slug: string; name: string };

export function CategoriesMarquee({ categories }: { categories: Category[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Duplicate items for seamless loop
  const items = [...categories, ...categories, ...categories];

  // Pause on hover/touch
  function pause() { setPaused(true); }
  function resume() { setPaused(false); }

  return (
    <div
      style={{ overflow: "hidden", position: "relative", cursor: "grab" }}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "48px", background: "linear-gradient(to right, rgb(250,248,245), transparent)", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48px", background: "linear-gradient(to left, rgb(250,248,245), transparent)", zIndex: 1, pointerEvents: "none" }} />

      {/* Scrollable + auto-scroll track */}
      <div
        ref={trackRef}
        className="categories-marquee-track"
        style={{
          display: "flex",
          gap: "0.75rem",
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch" as any,
          padding: "6px 4px 10px",
          animationPlayState: paused ? "paused" : "running",
        }}
        onMouseDown={(e) => {
          const el = trackRef.current;
          if (!el) return;
          setPaused(true);
          const startX = e.pageX - el.offsetLeft;
          const startScroll = el.scrollLeft;
          const move = (e: MouseEvent) => { el.scrollLeft = startScroll - (e.pageX - el.offsetLeft - startX); };
          const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); setPaused(false); };
          document.addEventListener("mousemove", move);
          document.addEventListener("mouseup", up);
        }}
      >
        <style>{`
          .categories-marquee-track::-webkit-scrollbar { display: none; }
          @keyframes cats-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-33.333%); }
          }
          .categories-marquee-inner {
            display: flex;
            gap: 0.75rem;
            animation: cats-scroll 18s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .categories-marquee-inner { animation: none; }
          }
        `}</style>
        <div className="categories-marquee-inner" style={{ animationPlayState: paused ? "paused" : "running" }}>
          {items.map((c, i) => (
            <Link
              key={c.slug + i}
              href={"/catalogue?categorie=" + c.slug}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "12px 20px",
                whiteSpace: "nowrap", flexShrink: 0,
                background: "transparent",
                color: "#1a1008",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em",
                border: "1.5px solid rgba(217,119,6,0.45)",
                borderRadius: "4px",
                textDecoration: "none",
                transition: "background .2s, color .2s, border-color .2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#d97706"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#d97706"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a1008"; e.currentTarget.style.borderColor = "rgba(217,119,6,0.45)"; }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
