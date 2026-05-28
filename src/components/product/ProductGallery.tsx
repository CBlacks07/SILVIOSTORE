"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

type Props = { images: string[]; alt: string; discount: number | null };

export function ProductGallery({ images, alt, discount }: Props) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const safeImages = images.length > 0 ? images : [];
  const current = safeImages[index];
  const hasMany = safeImages.length > 1;

  useEffect(() => { setMounted(true); }, []);

  // Swipe tactile
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) next(); else prev();
    touchStartX.current = null;
  }

  // Close zoom on ESC
  useEffect(() => {
    if (!zoomed) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setZoomed(false); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [zoomed]);

  function prev() { setIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1)); }
  function next() { setIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1)); }

  return (
    <>
      <div className="space-y-4 w-full max-w-[500px] mx-auto lg:mx-0">
        {/* Main image */}
        <div
          className="relative w-full overflow-hidden rounded-3xl border border-brand-100 cursor-zoom-in"
          style={{ aspectRatio: "1/1", maxHeight: "clamp(280px, 80vw, 520px)", background: "rgb(248,248,250)" }}
          onClick={() => current && setZoomed(true)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={current} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0">
                <Image src={current} alt={alt} fill priority className="object-contain p-4" sizes="(min-width:1024px) 50vw, 100vw" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom hint */}
          {current && (
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 opacity-0 hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.50)", color: "#fff", padding: "4px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>
              <ZoomIn size={13} /> Agrandir
            </div>
          )}

          {discount && discount > 0 && discount <= 95 && (
            <span className="absolute left-3 top-3 z-10 font-black text-xs" style={{ background: "#d97706", color: "#fff", padding: "4px 10px", borderRadius: "999px" }}>
              -{discount}%
            </span>
          )}

          {hasMany && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full border border-brand-100 transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full border border-brand-100 transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 z-10 text-xs font-bold" style={{ background: "rgba(0,0,0,0.55)", color: "#fff", padding: "3px 10px", borderRadius: "999px" }}>
                {index + 1} / {safeImages.length}
              </span>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {hasMany && (
          <div className="flex gap-3 overflow-x-auto pb-2 px-0.5">
            {safeImages.slice(0, 12).map((src, i) => (
              <button key={src + i} type="button" onClick={() => setIndex(i)} aria-label={"Image " + (i + 1)}
                className={"relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 " +
                  (i === index ? "border-accent ring-2 ring-accent/20 scale-105 shadow-md" : "border-brand-100 hover:border-brand-300 bg-white opacity-70 hover:opacity-100")}>
                <Image src={src} alt={alt + " " + (i + 1)} fill className="object-contain p-1.5" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom lightbox — portal */}
      {mounted && zoomed && current && createPortal(
        <div
          style={{ position: "fixed", inset: 0, zIndex: 999999, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
          onClick={() => setZoomed(false)}
        >
          {/* Close */}
          <button onClick={() => setZoomed(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "999px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", zIndex: 2 }}>
            <X size={20} />
          </button>

          {/* Counter */}
          {hasMany && (
            <span style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.12)", color: "#fff", padding: "4px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 600 }}>
              {index + 1} / {safeImages.length}
            </span>
          )}

          {/* Image */}
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "min(90vw, 90vh)", height: "min(90vw, 90vh)", cursor: "default" }}
          >
            <Image src={current} alt={alt} fill className="object-contain" sizes="90vw" priority />
          </motion.div>

          {/* Nav arrows */}
          {hasMany && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "999px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "999px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
