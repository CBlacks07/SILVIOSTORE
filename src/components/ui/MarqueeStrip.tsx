"use client";

const ITEMS = [
  "Livraison sous région",
  "Paiement Mobile Money",
  "Retours 7 jours",
  "Produits garantis",
];

const repeated = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

export function MarqueeStrip() {
  return (
    <div className="relative flex w-full overflow-hidden bg-black py-8 border-y border-white/10">
      <div className="absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-black to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-black to-transparent pointer-events-none" />

      <style>{`
        @keyframes marquee-x {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          align-items: center;
          gap: 200px;
          padding: 0 100px;
          white-space: nowrap;
          animation: marquee-x 35s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>

      <div className="marquee-track">
        {repeated.map((item, idx) => (
          <div key={idx} className="flex items-center gap-[200px]">
            <span className="text-base md:text-xl font-black uppercase text-white" style={{ letterSpacing: "0.5em", textShadow: "0 4px 10px rgba(0,0,0,1)" }}>
              {item}
            </span>
            <div className="h-3 w-3 rounded-full bg-accent" style={{ boxShadow: "0 0 12px rgba(217,119,6,0.8)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
