"use client";

import React from "react";
import { motion } from "framer-motion";

export function MarqueeStrip() {
  const items = [
    "Livraison sous région",
    "Paiement Mobile Money",
    "Retours 7 jours",
    "Produits garantis",
  ];

  // Multiple repetitions for a truly infinite feel with massive gaps
  const doubledItems = [...items, ...items, ...items, ...items, ...items];

  return (
    <div className="relative flex w-full overflow-hidden bg-black py-8 border-y border-white/10">
      {/* Soft fade edges for premium look */}
      <div className="absolute inset-y-0 left-0 z-10 w-40 bg-gradient-to-r from-black to-transparent" />
      <div className="absolute inset-y-0 right-0 z-10 w-40 bg-gradient-to-l from-black to-transparent" />

      <motion.div
        className="flex items-center gap-[200px] whitespace-nowrap px-[100px]"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          ease: "linear",
          duration: 35,
          repeat: Infinity,
        }}
      >
        {doubledItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-[200px]">
            <span 
              className="text-base md:text-xl font-black uppercase tracking-[0.5em] text-white"
              style={{ 
                textShadow: "0 4px 10px rgba(0,0,0,1)",
                letterSpacing: "0.5em" 
              }}
            >
              {item}
            </span>
            <div className="flex h-3 w-3 items-center justify-center">
              <div className="h-full w-full rounded-full bg-accent shadow-[0_0_20px_rgba(217,119,6,1)] animate-pulse" />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
