"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  link_url?: string | null;
};

const AUTOPLAY = 5000;

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 350);
  }, [animating]);

  const next = useCallback(() => go((current + 1) % banners.length), [current, banners.length, go]);
  const prev = useCallback(() => go((current - 1 + banners.length) % banners.length), [current, banners.length, go]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(next, AUTOPLAY);
    return () => clearInterval(t);
  }, [next, banners.length]);

  if (!banners.length) return null;

  const b = banners[current];

  const content = (
    <div style={{
      position: "relative",
      width: "100%",
      background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 100%)",
      overflow: "hidden",
      minHeight: "clamp(280px, 45vw, 480px)",
      display: "flex",
    }}>
      {/* Gold glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 0% 50%, rgba(217,119,6,0.18) 0%, transparent 55%)", pointerEvents: "none", zIndex: 1 }} />

      {/* Left — text */}
      <div style={{
        flex: "0 0 50%", maxWidth: "50%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "clamp(32px, 5vw, 64px)",
        position: "relative", zIndex: 2,
        opacity: animating ? 0 : 1,
        transform: animating ? "translateX(-16px)" : "translateX(0)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}>
        <h2 style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: "clamp(20px, 3vw, 36px)",
          fontWeight: 700, color: "#fff", lineHeight: 1.2,
          margin: "0 0 12px",
        }}>
          {b.title}
        </h2>
        {b.subtitle && (
          <p style={{ fontSize: "clamp(13px, 1.4vw, 15px)", color: "rgba(253,230,138,0.80)", lineHeight: 1.6, margin: "0 0 24px", maxWidth: "400px" }}>
            {b.subtitle}
          </p>
        )}
        {b.cta_label && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", borderRadius: "999px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, boxShadow: "0 4px 20px rgba(217,119,6,0.40)", width: "fit-content" }}>
            {b.cta_label} →
          </div>
        )}
      </div>

      {/* Right — image */}
      <div style={{ flex: "0 0 50%", maxWidth: "50%", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          opacity: animating ? 0 : 1,
          transform: animating ? "scale(1.04)" : "scale(1)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
          {b.image_url
            ? <img src={b.image_url} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.04)" }} />
          }
          {/* Gradient left edge */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, #1a1008, transparent)", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); prev(); }} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 3, width: "40px", height: "40px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", backdropFilter: "blur(4px)", transition: "background 0.2s" }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(217,119,6,0.50)")}
            onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            <ChevronLeft size={18} />
          </button>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); next(); }} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 3, width: "40px", height: "40px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", backdropFilter: "blur(4px)", transition: "background 0.2s" }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(217,119,6,0.50)")}
            onMouseOut={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 3 }}>
            {banners.map((_, i) => (
              <button key={i} onClick={e => { e.preventDefault(); e.stopPropagation(); go(i); }} style={{ height: "3px", width: i === current ? "24px" : "6px", borderRadius: "999px", border: "none", cursor: "pointer", padding: 0, background: i === current ? "#d97706" : "rgba(255,255,255,0.40)", transition: "width 0.3s ease, background 0.3s ease" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return b.link_url
    ? <Link href={b.link_url} style={{ textDecoration: "none", display: "block" }}>{content}</Link>
    : content;
}
