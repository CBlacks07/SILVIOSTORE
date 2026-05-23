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

const AUTOPLAY = 5500;
const FADE_MS  = 420;

export function BannerSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent]     = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, FADE_MS);
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

  return (
    <div style={{ position: "relative", width: "100%", background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 100%)", overflow: "hidden" }}>
      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1.0); }
          to   { transform: scale(1.09); }
        }
        .bs-ken-img {
          width: 100%; height: 100%;
          object-fit: cover;
          transform-origin: center center;
          animation: kenBurns 6s ease-out forwards;
        }
        .bs-layout {
          display: flex;
          flex-direction: column;
          min-height: 360px;
        }
        @media(min-width: 768px) {
          .bs-layout {
            flex-direction: row;
            min-height: clamp(300px, 45vw, 480px);
          }
        }
        .bs-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px 20px;
          position: relative;
          z-index: 2;
          order: 2;
        }
        @media(min-width: 768px) {
          .bs-text {
            justify-content: center;
            padding: clamp(32px, 5vw, 64px);
            flex: 0 0 50%;
            max-width: 50%;
            order: 1;
          }
        }
        .bs-img {
          position: relative;
          overflow: hidden;
          height: 220px;
          order: 1;
        }
        @media(min-width: 768px) {
          .bs-img {
            flex: 0 0 50%;
            max-width: 50%;
            height: auto;
            order: 2;
          }
        }
        .bs-title { font-family: var(--font-playfair),Georgia,serif; font-size: clamp(18px,3vw,34px); font-weight:700; color:#fff; line-height:1.2; margin:0 0 8px; }
        .bs-sub   { font-size:clamp(12px,1.4vw,14px); color:rgba(253,230,138,0.80); line-height:1.6; margin:0 0 20px; max-width:400px; }
        .bs-cta   { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#d97706,#f59e0b); color:#fff; border-radius:999px; padding:11px 22px; font-size:13px; font-weight:700; box-shadow:0 4px 20px rgba(217,119,6,0.40); width:fit-content; }
      `}</style>

      {/* Gold glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 0% 50%, rgba(217,119,6,0.18) 0%, transparent 55%)", pointerEvents: "none", zIndex: 1 }} />

      <div className="bs-layout">
        {/* Text — fade + slight rise */}
        <div
          className="bs-text"
          style={{
            opacity:    animating ? 0 : 1,
            transform:  animating ? "translateY(12px)" : "translateY(0)",
            transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
          }}
        >
          <h2 className="bs-title">{b.title}</h2>
          {b.subtitle && <p className="bs-sub">{b.subtitle}</p>}
          {b.cta_label && (
            b.link_url
              ? <Link href={b.link_url} onClick={e => e.stopPropagation()} className="bs-cta" style={{ textDecoration: "none" }}>{b.cta_label} →</Link>
              : <div className="bs-cta">{b.cta_label} →</div>
          )}
        </div>

        {/* Image — fade + Ken Burns zoom */}
        <div className="bs-img">
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity:    animating ? 0 : 1,
              transition: `opacity ${FADE_MS}ms ease`,
            }}
          >
            {b.image_url
              ? <img key={current} src={b.image_url} alt={b.title} className="bs-ken-img" />
              : <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.04)" }} />
            }
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, #1a1008, transparent)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "60px", background: "linear-gradient(to right, #1a1008, transparent)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); prev(); }}
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 10, width: "36px", height: "36px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "background 0.2s" }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(217,119,6,0.60)")}
            onMouseOut={e  => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          ><ChevronLeft size={16} /></button>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); next(); }}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 10, width: "36px", height: "36px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "background 0.2s" }}
            onMouseOver={e => (e.currentTarget.style.background = "rgba(217,119,6,0.60)")}
            onMouseOut={e  => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
          ><ChevronRight size={16} /></button>

          {/* Dots */}
          <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 10 }}>
            {banners.map((_, i) => (
              <button key={i} onClick={e => { e.preventDefault(); e.stopPropagation(); go(i); }}
                style={{ height: "3px", width: i === current ? "22px" : "6px", borderRadius: "999px", border: "none", cursor: "pointer", padding: 0, background: i === current ? "#d97706" : "rgba(255,255,255,0.40)", transition: "width 0.3s ease" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
