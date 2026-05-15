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
    <div className="space-y-4 w-full max-w-[500px] mx-auto lg:mx-0">
      <div className="relative w-full overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm" style={{ aspectRatio: "1/1", maxHeight: "clamp(280px, 80vw, 520px)", background: "rgb(248,248,250)" }}>
        <AnimatePresence mode="wait">
          {current && (
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
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
          <span className="absolute left-5 top-5 badge bg-accent text-white z-10 px-3 py-1 font-black shadow-lg">-{discount}%</span>
        )}
        {hasMany && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-brand-950 shadow-xl border border-brand-100 hover:bg-white hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-brand-950 shadow-xl border border-brand-100 hover:bg-white hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <span className="absolute bottom-4 right-4 z-10 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-bold text-white tracking-widest shadow-lg">
              {index + 1} / {safeImages.length}
            </span>
          </>
        )}
      </div>

      {hasMany && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-0.5">
          {safeImages.slice(0, 12).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={"Voir image " + (i + 1)}
              className={
                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 " +
                (i === index
                  ? "border-accent ring-2 ring-accent/20 scale-105 shadow-md"
                  : "border-brand-100 hover:border-brand-300 bg-white opacity-70 hover:opacity-100")
              }
            >
              <Image src={src} alt={alt + " " + (i + 1)} fill className="object-contain p-1.5" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
