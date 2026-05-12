"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
  discount: number | null;
};

export function ProductGallery({ images, alt, discount }: Props) {
  const [index, setIndex] = useState(0);
  const safeImages = images.length > 0 ? images : [];
  const current = safeImages[index];
  const hasMany = safeImages.length > 1;

  function prev() {
    setIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  }
  function next() {
    setIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-3 w-full max-w-[460px] mx-auto lg:mx-0">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl ring-1 ring-brand-100" style={{ background: "rgb(245,247,250)" }}>
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={current}
                alt={alt}
                fill
                priority
                className="object-contain p-4"
                sizes="(min-width:1024px) 50vw, 100vw"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {discount && (
          <span className="absolute left-4 top-4 badge bg-accent text-white z-10">-{discount}%</span>
        )}
        {hasMany && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-900 shadow hover:bg-white hover:scale-105 active:scale-95 transition-transform"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-900 shadow hover:bg-white hover:scale-105 active:scale-95 transition-transform"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {index + 1} / {safeImages.length}
            </span>
          </>
        )}
      </div>

      {hasMany && (
        <div className="flex gap-2 overflow-x-auto px-1 py-2 -mx-1">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={"Voir image " + (i + 1)}
              className={
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition " +
                (i === index
                  ? "border-accent shadow-[0_2px_8px_rgba(217,119,6,0.25)]"
                  : "border-brand-100 hover:border-brand-300")
              }
            >
              <Image src={src} alt={alt + " " + (i + 1)} fill className="object-contain p-1" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
