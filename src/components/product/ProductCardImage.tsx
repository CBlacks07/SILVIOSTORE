"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveColor } from "./ProductCard";

type ColorOption = { label: string; value: string };

type Props = {
  images: string[];
  alt: string;
  discount: number | null;
  outOfStock: boolean;
  colorOptions: ColorOption[];
};

export function ProductCardImage({ images, alt, discount, outOfStock, colorOptions }: Props) {
  const [selectedColor, setSelectedColor] = useState<number>(0);

  const cover = images[selectedColor] ?? images[0];

  return (
    <>
      {/* Image */}
      <div className="relative aspect-square w-full bg-brand-50 overflow-hidden rounded-t-2xl">
        {cover ? (
          <Image
            src={cover}
            alt={alt}
            fill
            sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw"
            className="object-cover transition-all duration-500"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-brand-300 text-xs">
            Aucune image
          </div>
        )}

        {discount && discount > 0 && (
          <span className="absolute left-2.5 top-2.5 z-10 text-[10px] font-black bg-accent text-white px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-500 bg-white/90 px-3 py-1 rounded-full">
              Rupture
            </span>
          </div>
        )}
      </div>

      {/* Swatches sous l'image */}
      {colorOptions.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 pt-2 pb-1 md:px-4 flex-wrap">
          {colorOptions.slice(0, 6).map((opt, i) => (
            <button
              key={i}
              type="button"
              title={opt.label}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedColor(i);
              }}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "999px",
                background: resolveColor(opt.value || opt.label),
                flexShrink: 0,
                cursor: "pointer",
                border: selectedColor === i ? "2.5px solid #d97706" : "2px solid rgba(0,0,0,0.12)",
                boxShadow: selectedColor === i ? "0 0 0 2px rgba(217,119,6,0.25)" : "none",
                transition: "all 0.15s ease",
                transform: selectedColor === i ? "scale(1.25)" : "scale(1)",
              }}
            />
          ))}
          {colorOptions.length > 6 && (
            <span className="text-[10px] font-bold text-brand-400">+{colorOptions.length - 6}</span>
          )}
        </div>
      )}
    </>
  );
}
