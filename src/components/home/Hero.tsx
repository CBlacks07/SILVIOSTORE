"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck } from "lucide-react";

const AUTOPLAY_MS = 7000;
const ease = [0.22, 1, 0.36, 1] as const;

// Per-slide right-pane background colors (cycles if there are more slides than swatches).
// These pull from the brand-orange family + a warm cream + a charbon dark for rhythm.
const PANEL_BGS = [
  { bg: "transparent", caption: "rgba(255,255,255,0.88)" },
  { bg: "transparent", caption: "rgba(255,255,255,0.88)" },
  { bg: "transparent", caption: "rgba(255,255,255,0.88)" },
  { bg: "transparent", caption: "rgba(255,255,255,0.88)" },
];

type Slide = {
  image_url: string;
  title?: string;
  subtitle?: string;
  badge_text?: string;
  cta_label?: string;
  cta_link?: string;
  cta2_label?: string;
  cta2_link?: string;
  product_name?: string;
  price?: string;
};

export function Hero({ hero, extraImages = [] }: any) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  const slides = useMemo<Slide[]>(() => {
    const arr: Slide[] = [];

    if (Array.isArray(hero?.slides)) {
      hero.slides.forEach((s: any) => {
        // Accept slide if it has an image OR meaningful text
        if (s?.image_url || s?.title) arr.push(s);
      });
    }

    // Fallback: single slide from top-level hero settings
    if (arr.length === 0) {
      arr.push({
        image_url:  hero?.image_url || hero?.image || "",
        title:      hero?.title      || "Le luxe au bout des doigts",
        subtitle:   hero?.subtitle   || "La référence des accessoires premium dans la sous région.",
        badge_text: hero?.badge_text || "SILVIO STORE",
        cta_label:  hero?.cta_label  || "Découvrir la collection",
        cta_link:   hero?.cta_link   || "/catalogue",
        cta2_label: hero?.cta2_label || "",
        cta2_link:  hero?.cta2_link  || "",
      });
    }

    // Add banner images as extra slides
    if (Array.isArray(extraImages)) {
      extraImages.forEach((url: string) => {
        if (url && !arr.find((s) => s.image_url === url)) {
          arr.push({
            image_url: url,
            title:    hero?.title    || "Le luxe au bout des doigts",
            subtitle: hero?.subtitle || "",
          });
        }
      });
    }

    return arr;
  }, [hero, extraImages]);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1 || paused || reduce) return;
    const id = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length, paused, reduce]);

  if (!slides.length) return null;

  const slide = slides[current];
  const panel = PANEL_BGS[current % PANEL_BGS.length];
  const hasMany = slides.length > 1;

  const titleParts = (slide.title || "Le luxe au bout des doigts").split(/\s*\/\s*/);
  // Allow editorial line breaks via "Title / Line 2 / Line 3" in admin

  return (
    <section
      className="hero-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-section {
          position: relative;
          background: linear-gradient(135deg, #1a1008 0%, #2c1c06 50%, #1a1008 100%);
          overflow: hidden;
        }
        .hero-grid {
          display: flex;
          flex-direction: column;
          min-height: auto;
        }
        @media (min-width: 1024px) {
          .hero-grid {
            display: grid;
            grid-template-columns: 1.05fr 1fr;
            align-items: stretch;
            min-height: clamp(600px, 85vh, 820px);
            max-width: 1920px;
            margin: 0 auto;
          }
        }

        /* ───── LEFT PANE ───── */
        .hero-left {
          position: relative;
          padding: clamp(48px, 8vh, 96px) clamp(24px, 5vw, 80px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: clamp(20px, 3vh, 32px);
          z-index: 2;
        }
        .hero-left::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 10% 20%, rgba(217,119,6,0.05) 0%, transparent 50%),
            radial-gradient(circle at 90% 80%, rgba(217,119,6,0.03) 0%, transparent 50%);
          pointer-events: none;
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-size: clamp(10px, 1.2vw, 11px);
          font-weight: 800;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: #d97706;
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards 0.2s;
        }
        .hero-eyebrow::before {
          content: "";
          width: clamp(20px, 3vw, 32px);
          height: 2px;
          background: linear-gradient(90deg, #d97706, rgba(217,119,6,0.4));
          border-radius: 2px;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-weight: 700;
          font-size: clamp(36px, 7vw, 92px);
          line-height: 1.05;
          letter-spacing: -0.025em;
          color: #ffffff;
          margin: 0;
        }
        .hero-title .accent {
          color: #d97706;
          font-style: italic;
          position: relative;
          display: inline-block;
        }
        .hero-sub {
          max-width: 540px;
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-size: clamp(15px, 1.8vw, 17px);
          line-height: 1.7;
          color: rgba(253,230,138,0.88);
          margin: 0;
          font-weight: 400;
        }
        .hero-ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 4px;
        }
        .hero-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: clamp(14px, 1.8vh, 18px) clamp(24px, 3vw, 32px);
          background: #d97706;
          color: #fff;
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-size: clamp(13px, 1.6vw, 15px);
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(15,20,25,0.12), 0 2px 4px rgba(15,20,25,0.08);
          position: relative;
          overflow: hidden;
        }
        .hero-cta-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #d97706, #f59e0b);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .hero-cta-primary:hover::before {
          opacity: 1;
        }
        .hero-cta-primary:hover {
          box-shadow: 0 8px 24px rgba(217,119,6,0.24), 0 4px 8px rgba(217,119,6,0.16);
          transform: translateY(-2px);
        }
        .hero-cta-primary span {
          position: relative;
          z-index: 1;
        }
        .hero-cta-primary .arrow {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          z-index: 1;
        }
        .hero-cta-primary:hover .arrow {
          transform: translateX(4px);
        }
        .hero-cta-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: clamp(14px, 1.8vh, 18px) clamp(20px, 2.5vw, 28px);
          background: transparent;
          color: rgba(253,230,138,0.90);
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-size: clamp(13px, 1.6vw, 15px);
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          border: 1.5px solid rgba(217,119,6,0.50);
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        .hero-cta-secondary:hover {
          background: rgba(217,119,6,0.15);
          color: #fff;
          border-color: #d97706;
          transform: translateY(-1px);
        }

        /* trust signals row */
        .hero-trust {
          display: flex;
          flex-wrap: wrap;
          gap: clamp(20px, 3vw, 32px) clamp(24px, 4vw, 40px);
          margin-top: clamp(24px, 4vh, 40px);
          padding-top: clamp(24px, 3vh, 32px);
          border-top: 1px solid rgba(15,20,25,0.08);
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards 1s;
        }
        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .hero-trust-item:hover .hero-trust-icon {
          background: rgba(217,119,6,0.15);
          transform: scale(1.05);
        }
        .hero-trust-icon {
          width: clamp(36px, 5vw, 40px);
          height: clamp(36px, 5vw, 40px);
          border-radius: 999px;
          background: rgba(217,119,6,0.1);
          color: #d97706;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }
        .hero-trust-text {
          display: flex;
          flex-direction: column;
        }
        .hero-trust-num {
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(14px, 1.6vw, 16px);
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums;
        }
        .hero-trust-label {
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-size: clamp(11px, 1.3vw, 13px);
          color: #6b7280;
          line-height: 1.4;
          margin-top: 2px;
          font-weight: 500;
        }

        /* ───── RIGHT PANE ───── */
        .hero-right {
          position: relative;
          overflow: hidden;
          min-height: clamp(480px, 70vh, 820px);
          width: 100%;
        }
        @media (max-width: 1024px) {
          .hero-right {
            order: -1;
            width: 100%;
            min-height: clamp(260px, 60vw, 420px);
          }
        }
        @media (max-width: 640px) {
          .hero-right {
            width: 100%;
            min-height: 280px;
          }
        }
        .hero-right-bg {
          position: absolute;
          inset: 0;
          transition: background-color .9s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .hero-right-grain {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' /></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>");
        }
        .hero-image-frame {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .hero-image-wrap {
          position: relative;
          width: 100%;
          height: 100%;
        }

        /* product caption (bottom right of right pane) */
        .hero-caption {
          position: absolute;
          left: clamp(16px, 4vw, 40px);
          right: clamp(16px, 4vw, 40px);
          bottom: clamp(16px, 3vw, 32px);
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          z-index: 3;
          background: rgba(15, 10, 4, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(217, 119, 6, 0.20);
          border-radius: 12px;
          padding: 14px 20px;
        }
        .hero-caption-meta {
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .hero-caption-name {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(18px, 2vw, 24px);
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-top: 6px;
          line-height: 1.25;
          max-width: 280px;
        }
        .hero-caption-price {
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-weight: 800;
          font-size: clamp(22px, 2.4vw, 32px);
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        /* slide counter / progress */
        .hero-progress {
          position: absolute;
          top: clamp(24px, 4vh, 40px);
          right: clamp(24px, 5vw, 64px);
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 3;
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }
        .hero-progress-num { font-variant-numeric: tabular-nums; }
        .hero-progress-bar {
          width: clamp(60px, 10vw, 90px);
          height: 2px;
          background: rgba(255,255,255,0.2);
          position: relative;
          overflow: hidden;
          border-radius: 2px;
        }
        .hero-progress-bar.dark { background: rgba(15,20,25,0.2); }
        .hero-progress-fill {
          position: absolute;
          inset: 0;
          background: currentColor;
          transform-origin: left;
        }

        /* arrows */
        .hero-arrows {
          position: absolute;
          left: clamp(24px, 5vw, 64px);
          top: clamp(24px, 4vh, 40px);
          display: flex;
          gap: 10px;
          z-index: 3;
        }
        .hero-arrow {
          width: clamp(38px, 5vw, 44px);
          height: clamp(38px, 5vw, 44px);
          display: grid;
          place-items: center;
          background: transparent;
          color: inherit;
          border: 2px solid currentColor;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.6;
          backdrop-filter: blur(8px);
        }
        .hero-arrow:hover {
          opacity: 1;
          transform: scale(1.08);
          background: rgba(255,255,255,0.1);
        }
        .hero-arrow:active { transform: scale(0.95); }

        /* badge floating top-left of right pane */
        .hero-badge {
          position: absolute;
          left: clamp(24px, 5vw, 64px);
          bottom: clamp(108px, 14vh, 144px);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #d97706, #f59e0b);
          color: #fff;
          font-family: var(--font-inter), Inter, system-ui, sans-serif;
          font-size: clamp(10px, 1.2vw, 11px);
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          border-radius: 999px;
          z-index: 3;
          box-shadow: 0 8px 24px rgba(217,119,6,0.28);
          backdrop-filter: blur(8px);
        }
        .hero-badge .dot {
          width: 7px;
          height: 7px;
          background: #fff;
          border-radius: 999px;
          animation: pulse 1.6s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(0.8); }
        }

        @media (max-width: 1024px) {
          .hero-progress {
            display: flex;
            top: 12px;
            right: 16px;
            font-size: 11px;
            gap: 10px;
          }
          .hero-progress-bar { width: 50px; }
          .hero-arrows {
            display: flex;
            top: 8px;
            left: 12px;
            gap: 6px;
          }
          .hero-arrow { width: 32px; height: 32px; }
          .hero-caption {
            left: 16px;
            right: 16px;
            bottom: 12px;
          }
          .hero-badge { bottom: 80px; left: 16px; }
          .hero-trust {
            gap: 16px 20px;
            margin-top: 24px;
            padding-top: 20px;
          }
          .hero-trust-item {
            flex: 1 1 auto;
            min-width: calc(50% - 10px);
          }
        }
        
        @media (max-width: 640px) {
          .hero-left {
            padding: 32px 20px;
            gap: 20px;
          }
          .hero-badge {
            bottom: 76px;
            left: 20px;
            font-size: 10px;
            padding: 8px 14px;
          }
          .hero-caption {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      ` }} />

      <div className="hero-grid">
        {/* ─────────── LEFT: editorial copy + CTAs + trust ─────────── */}
        <div className="hero-left">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={"left-" + current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.55, ease }}
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              <span className="hero-eyebrow">
                {slide.badge_text || "Nouvelle collection · Sélection 2026"}
              </span>

              <h1 className="hero-title">
                {titleParts.length > 1 ? (
                  titleParts.map((part, i) => (
                    <span key={i} style={{ display: "block" }}>
                      {i === titleParts.length - 1 ? (
                        <span className="accent">{part}</span>
                      ) : (
                        part
                      )}
                    </span>
                  ))
                ) : (
                  <>
                    Le luxe<br />au bout<br />
                    <span className="accent">des doigts.</span>
                  </>
                )}
              </h1>

              <p className="hero-sub">
                {slide.subtitle ||
                  "Coques, étuis cuir et accessoires haut de gamme pour iPhone et Samsung. Sélectionnés à la main, livrés partout en Afrique de l'Ouest."}
              </p>

              <div className="hero-ctas">
                <Link href={slide.cta_link || "/catalogue"} className="hero-cta-primary">
                  <span>{slide.cta_label || "Explorer le catalogue"}</span>
                  <span className="arrow" aria-hidden>→</span>
                </Link>
                {(slide.cta2_label && slide.cta2_link) ? (
                  <Link href={slide.cta2_link} className="hero-cta-secondary">
                    {slide.cta2_label}
                  </Link>
                ) : (
                  <Link href="/catalogue?categorie=nouveautes" className="hero-cta-secondary">
                    Voir les nouveautés
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Trust strip — static across slides */}
          <div className="hero-trust">
            <div className="hero-trust-item">
              <div className="hero-trust-icon"><Star className="h-4 w-4" fill="#d97706" /></div>
              <div className="hero-trust-text">
                <span className="hero-trust-num">4,9 / 5</span>
                <span className="hero-trust-label">200+ avis vérifiés</span>
              </div>
            </div>
            <div className="hero-trust-item">
              <div className="hero-trust-icon"><Truck className="h-4 w-4" /></div>
              <div className="hero-trust-text">
                <span className="hero-trust-num">Livraison &lt; 72h</span>
                <span className="hero-trust-label">Sous-région ouest-africaine</span>
              </div>
            </div>
            <div className="hero-trust-item">
              <div className="hero-trust-icon"><ShieldCheck className="h-4 w-4" /></div>
              <div className="hero-trust-text">
                <span className="hero-trust-num">Garantie 30 jours</span>
                <span className="hero-trust-label">Échange ou remboursement</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────── RIGHT: product showcase (hide on mobile if no image) ─────────── */}
        <div
          className={`hero-right${!slide.image_url ? " hidden lg:block" : ""}`}
          style={{ color: panel.caption }}
        >
          {/* Animated background swatch — color crossfades between slides */}
          <div className="hero-right-bg" style={{ background: panel.bg }} />
          <div className="hero-right-grain" />

          {/* Image crossfade */}
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={"img-" + current}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.9, ease }}
              className="hero-image-frame"
            >
              <div className="hero-image-wrap">
                <Image
                  src={slide.image_url}
                  alt={slide.product_name || slide.title || "Produit en vedette"}
                  fill
                  priority={current === 0}
                  sizes="(max-width: 900px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Live badge if slide has badge_text and we're showing it elsewhere — skip duplicating */}
          {slide.badge_text && slide.badge_text.toLowerCase().includes("drop") && (
            <div className="hero-badge">
              <span className="dot" />
              {slide.badge_text}
            </div>
          )}

          {/* Top: arrows + counter */}
          {hasMany && (
            <>
              <div className="hero-arrows">
                <button
                  className="hero-arrow"
                  aria-label="Slide précédent"
                  onClick={() => setCurrent((i) => (i === 0 ? slides.length - 1 : i - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  className="hero-arrow"
                  aria-label="Slide suivant"
                  onClick={() => setCurrent((i) => (i + 1) % slides.length)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="hero-progress">
                <span className="hero-progress-num">
                  {String(current + 1).padStart(2, "0")}
                </span>
                <div
                  className={"hero-progress-bar" + (panel.caption === "#1f2a3c" ? " dark" : "")}
                >
                  <motion.div
                    className="hero-progress-fill"
                    key={"fill-" + current + "-" + paused}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: paused || reduce ? 0 : 1 }}
                    transition={{
                      duration: paused || reduce ? 0 : AUTOPLAY_MS / 1000,
                      ease: "linear",
                    }}
                  />
                </div>
                <span className="hero-progress-num">
                  {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            </>
          )}

          {/* Bottom: product caption with frosted glass */}
          <div className="hero-caption" style={{ color: "#ffffff" }}>
            <div>
              <div className="hero-caption-meta" style={{ color: "#d97706", opacity: 1 }}>
                En vedette
              </div>
              <div className="hero-caption-name" style={{ color: "#ffffff" }}>
                {slide.product_name || slide.title || "Coque cuir signature"}
              </div>
            </div>
            {slide.price && (
              <div className="hero-caption-price" style={{ color: "#f59e0b" }}>{slide.price}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
