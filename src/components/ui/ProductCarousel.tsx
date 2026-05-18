"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 4);
    setProgress(scrollWidth > clientWidth ? scrollLeft / (scrollWidth - clientWidth) : 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { el.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [update]);

  function scroll(dir: "left" | "right") {
    const el = ref.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Arrows */}
      {canLeft && (
        <button onClick={() => scroll("left")} aria-label="Précédent"
          style={{ position: "absolute", left: "-20px", top: "40%", transform: "translateY(-50%)", zIndex: 10, width: "40px", height: "40px", borderRadius: "999px", background: "#fff", border: "1.5px solid rgba(217,119,6,0.30)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", transition: "all 0.15s" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "#d97706"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = ""; }}
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll("right")} aria-label="Suivant"
          style={{ position: "absolute", right: "-20px", top: "40%", transform: "translateY(-50%)", zIndex: 10, width: "40px", height: "40px", borderRadius: "999px", background: "#fff", border: "1.5px solid rgba(217,119,6,0.30)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", transition: "all 0.15s" }}
          onMouseOver={(e) => { e.currentTarget.style.background = "#d97706"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = ""; }}
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Scroll container */}
      <div ref={ref}
        style={{ display: "flex", gap: "1.25rem", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "4px", scrollSnapType: "x mandatory" }}
        className="carousel-hide-scroll"
      >
        {children}
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: "16px", height: "3px", background: "rgba(217,119,6,0.12)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, #d97706, #f59e0b)", borderRadius: "999px", width: `${Math.max(8, progress * 100)}%`, transition: "width 0.2s ease" }} />
      </div>
    </div>
  );
}
