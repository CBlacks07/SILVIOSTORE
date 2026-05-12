"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    word: "Luxe",
    color: "#d97706", // orange
    description:
      "Des accessoires haut de gamme soigneusement sélectionnés. Matériaux premium, finitions irréprochables — parce que votre appareil mérite le meilleur.",
  },
  {
    word: "Tendance",
    color: "#ffffff", // white — readable on dark bg
    description:
      "Les designs qui font tourner les têtes. Nous suivons les dernières tendances pour que vous soyez toujours en avance sur votre style.",
  },
  {
    word: "Protection",
    color: "#d97706", // orange
    description:
      "Au-delà du style, une protection sérieuse. Coques renforcées, pochettes rembourrées, verres trempés — votre appareil est entre de bonnes mains.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function WhySilvioStore() {
  return (
    <section className="bg-brand-950 text-white py-20 overflow-hidden relative">
      {/* Subtle backdrop accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, #d97706 0%, transparent 40%), radial-gradient(circle at 80% 100%, #d97706 0%, transparent 40%)",
        }}
      />

      <div className="container-page relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-4">
            Notre engagement
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-black tracking-tighter text-white">
            Trois raisons de choisir{" "}
            <span style={{ color: "#d97706" }}>SILVIO STORE</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={p.word}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease, delay: i * 0.15 }}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.04] p-8 lg:p-10 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm overflow-hidden"
            >
              {/* Outline number — readable on dark, no fighting fills */}
              <div
                className="mb-6 text-[7rem] leading-[0.85] font-black tracking-tighter select-none"
                style={{
                  color: "transparent",
                  WebkitTextStroke: `1.5px ${p.color === "#ffffff" ? "rgba(255,255,255,0.35)" : "rgba(217,119,6,0.55)"}`,
                  fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
                }}
                aria-hidden
              >
                0{i + 1}
              </div>

              <h3
                className="font-display text-3xl md:text-4xl font-black mb-4 tracking-tighter"
                style={{ color: p.color }}
              >
                {p.word}
              </h3>

              {/* Accent rule */}
              <div
                className="mb-5 h-[2px] w-12 rounded-full transition-all duration-300 group-hover:w-20"
                style={{
                  background: p.color === "#ffffff" ? "rgba(255,255,255,0.6)" : "#d97706",
                }}
              />

              <p className="text-white/75 leading-relaxed text-[15px]">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
