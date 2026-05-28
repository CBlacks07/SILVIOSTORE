"use client";

import { motion } from "framer-motion";
import type { TestimonialsSettings } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function Testimonials({ data }: { data: TestimonialsSettings }) {
  if (!data.enabled || !data.items.length) return null;

  const testimonials = data.items.map((t) => ({
    ...t,
    initial: t.name.charAt(0).toUpperCase(),
  }));

  // Duplicate the list so the marquee loops seamlessly (translateX(-50%) lands on a clone of slot 0).
  const loop = [...testimonials, ...testimonials];

  // Speed: ~28s for one full loop of the original set; keep it gentle.
  const durationSec = Math.max(24, testimonials.length * 7);

  return (
    <section className="section-band-soft py-20 overflow-hidden">
      <div className="container-page">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mb-3">
            Témoignages
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-950 tracking-tight">
            {data.title}
          </h2>
          <p className="mt-3 text-sm" style={{ fontFamily: "var(--font-roboto), Roboto, sans-serif", color: "#3b5377" }}>{data.subtitle}</p>
        </motion.div>
      </div>

      {/* Full-bleed marquee — escapes container-page so cards bleed off the right edge */}
      <div
        className="testimonials-marquee group relative"
        style={{
          // Soft fade on both edges so cards melt in/out instead of clipping
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
          maskImage:
            "linear-gradient(to right, transparent 0, #000 80px, #000 calc(100% - 80px), transparent 100%)",
        }}
      >
        <style>{`
          @keyframes testimonials-scroll {
            from { transform: translate3d(0, 0, 0); }
            to   { transform: translate3d(-50%, 0, 0); }
          }
          .testimonials-track {
            display: flex;
            gap: 24px;
            width: max-content;
            animation: testimonials-scroll ${durationSec}s linear infinite;
            will-change: transform;
          }
          .testimonials-marquee:hover .testimonials-track,
          .testimonials-marquee:focus-within .testimonials-track {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .testimonials-track {
              animation: none;
            }
            .testimonials-marquee {
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
            }
          }
        `}</style>

        <div className="testimonials-track" aria-label="Témoignages clients">
          {loop.map((t, i) => (
            <article
              key={i}
              className="shrink-0 flex flex-col"
              style={{
                width: "min(400px, 80vw)",
                background: "#ffffff",
                border: "1px solid rgba(217,119,6,0.18)",
                borderLeft: "3px solid #d97706",
                borderRadius: "4px",
                padding: "24px 24px 20px",
                boxShadow: "0 1px 2px rgba(15,23,42,0.03), 0 4px 20px rgba(217,119,6,0.06)",
              }}
              aria-hidden={i >= testimonials.length ? "true" : undefined}
            >
              {/* Quote glyph */}
              <div
                aria-hidden
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "56px",
                  lineHeight: 1,
                  color: "#d97706",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                &ldquo;
              </div>

              <p style={{ fontFamily: "var(--font-roboto), Roboto, system-ui, sans-serif", fontSize: "15px", lineHeight: 1.65, color: "#3b5377", flex: 1, margin: 0 }}>
                {t.text}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e4e9f0" }}>
                <div
                  style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#121826", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: "13px", fontWeight: 800, flexShrink: 0 }}
                >
                  {t.initial}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 700, fontSize: "13px", color: "#121826", margin: 0, letterSpacing: "-0.01em" }}>
                    {t.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                    <span aria-label={`${t.rating} sur 5`} style={{ color: "#d97706", fontSize: "12px", letterSpacing: "1px" }}>
                      {"★".repeat(t.rating)}
                    </span>
                    <span style={{ fontFamily: "var(--font-roboto), Roboto, sans-serif", fontSize: "11px", color: "#6f87aa" }}>{t.location}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* CTA laisser un avis */}
      <div className="container-page mt-10 text-center">
        <a
          href="https://www.google.com/search?q=SILVIO+STORE+Avis&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOc3j1OA2wPQcuXVfKLbyYgqgULX7xlej7SKORIfTrv3Y-krwCRQyx6Kqih2ytaSsjycNnWAr0ac2IHlond6bhytfAgB_"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all hover:opacity-90"
          style={{ background: "rgba(217,119,6,0.10)", border: "1px solid rgba(217,119,6,0.25)", color: "#d97706" }}
        >
          <span>★</span> Laisser un avis Google
        </a>
      </div>
    </section>
  );
}
