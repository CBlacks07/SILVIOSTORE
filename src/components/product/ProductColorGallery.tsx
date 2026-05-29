"use client";

import { useState } from "react";
import { ProductGallery } from "./ProductGallery";
import { resolveColor } from "./ProductCard";

type ColorOption = { label: string; value: string };

type Props = {
  images: string[];
  alt: string;
  discount: number | null;
  colorOptions: ColorOption[];
  slug: string;
};

export function ProductColorGallery({ images, alt, discount, colorOptions, slug }: Props) {
  const [selectedColor, setSelectedColor] = useState<number | null>(null);

  // Image active = image à l'index de la couleur sélectionnée (si elle existe), sinon ordre normal
  const activeImages = selectedColor !== null && images[selectedColor]
    ? [images[selectedColor], ...images.filter((_, i) => i !== selectedColor)]
    : images;

  return (
    <div className="space-y-4">
      <ProductGallery
        images={activeImages}
        alt={alt}
        discount={discount}
        hideThumbnails={colorOptions.length > 0}
        hideArrows={colorOptions.length > 0}
      />

      {colorOptions.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-400 mb-2">
            {selectedColor !== null ? (
              <>Couleur : <span className="text-brand-700">{colorOptions[selectedColor]?.label}</span></>
            ) : "Choisir une couleur"}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {colorOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                title={opt.label}
                onClick={() => setSelectedColor(selectedColor === i ? null : i)}
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "999px",
                  background: resolveColor(opt.value || opt.label),
                  flexShrink: 0,
                  cursor: "pointer",
                  border: selectedColor === i
                    ? "3px solid #d97706"
                    : "2px solid rgba(0,0,0,0.12)",
                  boxShadow: selectedColor === i
                    ? "0 0 0 2px rgba(217,119,6,0.30)"
                    : "none",
                  transition: "all 0.15s ease",
                  transform: selectedColor === i ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
