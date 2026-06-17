"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TestimonialsSettings } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

function TestimonialCard({ t }: { t: { name: string; location: string; rating: number; text: string; initial: string } }) {
  return (
    <article
      className="flex flex-col flex-1"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(217,119,6,0.18)",
        borderLeft: "3px solid #d97706",
        borderRadius: "4px",
        padding: "24px 24px 20px",
        boxShadow: "0 1px 2px rgba(15,23,42,0.03), 0 4px 20px rgba(217,119,6,0.06)",
        minWidth: 0,
      }}
    >
      <div
        aria-hidden
        style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: "56px", lineHeight: 1, color: "#d97706", marginBottom: "12px" }}
      >
        &ldquo;
      </div>

      <p style={{ fontFamily: "var(--font-roboto),Roboto,system-ui,sans-serif", fontSize: "15px", lineHeight: 1.65, color: "#3b5377", flex: 1, margin: 0 }}>
        {t.text}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e4e9f0" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "999px", background: "#121826", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter),Inter,sans-serif", fontSize: "13px", fontWeight: 800, flexShrink: 0 }}>
          {t.initial}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-inter),Inter,sans-serif", fontWeight: 700, fontSize: "13px", color: "#121826", margin: 0, letterSpacing: "-0.01em" }}>
            {t.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
            <span aria-label={`${t.rating} sur 5`} style={{ color: "#d97706", fontSize: "12px", letterSpacing: "1px" }}>
              {"★".repeat(t.rating)}
            </span>
            <span style={{ fontFamily: "var(--font-roboto),Roboto,sans-serif", fontSize: "11px", color: "#6f87aa" }}>{t.location}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Testimonials({ data }: { data: TestimonialsSettings }) {
  if (!data.enabled || !data.items.length) return null;

  const testimonials = data.items.map((t) => ({
    ...t,
    initial: t.name.charAt(0).toUpperCase(),
  }));

  // Groupes de 2
  const pages: (typeof testimonials)[] = [];
  for (let i = 0; i < testimonials.length; i += 2) {
    pages.push(testimonials.slice(i, i + 2));
  }

  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const numPages = pages.length;

  useEffect(() => {
    if (numPages <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setPage((p) => (p + 1) % numPages);
    }, 5000);
    return () => clearInterval(id);
  }, [numPages]);

  function goTo(next: number) {
    setDirection(next > page ? 1 : -1);
    setPage(next);
  }

  return (
    <section className="section-band-soft py-20">
      <div className="container-page">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
        >
          <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mb-3">Témoignages</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-950 tracking-tight">{data.title}</h2>
          <p className="mt-3 text-sm" style={{ fontFamily: "var(--font-roboto),Roboto,sans-serif", color: "#3b5377" }}>{data.subtitle}</p>
        </motion.div>

        {/* Carrousel 2 par 2 */}
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease }}
              className="flex gap-6"
            >
              {pages[page].map((t, i) => (
                <TestimonialCard key={i} t={t} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Points de navigation */}
        {numPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Groupe ${i + 1}`}
                onClick={() => goTo(i)}
                style={{
                  width: i === page ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: i === page ? "#d97706" : "rgba(217,119,6,0.25)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
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
      </div>
    </section>
  );
}
