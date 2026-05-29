"use client";

import { useState, useEffect } from "react";
import { ProductGallery } from "./ProductGallery";
import { resolveColor } from "./ProductCard";
import { useProductColor } from "@/store/productColor";

type ColorOption = { label: string; value: string };

type Props = {
  images: string[];
  alt: string;
  discount: number | null;
  colorOptions: ColorOption[];
  slug: string;
  productId: string;
};

export function ProductColorGallery({ images, alt, discount, colorOptions, slug, productId }: Props) {
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const setColor = useProductColor((s) => s.setColor);

  // Initialise le store avec la première couleur + image au montage
  useEffect(() => {
    if (colorOptions.length > 0) {
      setColor(productId, colorOptions[0].label, images[0] ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  function selectColor(i: number) {
    setSelectedColor(i);
    setColor(productId, colorOptions[i].label, images[i] ?? null);
  }

  const activeImages = images[selectedColor]
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
            {(() => {
              const label = colorOptions[selectedColor]?.label ?? "";
              const isHex = /^#[0-9a-f]{3,6}$/i.test(label);
              return isHex ? "Couleur sélectionnée" : `Couleur : ${label}`;
            })()}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {colorOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                title={opt.label}
                onClick={() => selectColor(i)}
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "999px",
                  background: resolveColor(opt.value || opt.label),
                  flexShrink: 0,
                  cursor: "pointer",
                  border: "2px solid rgba(0,0,0,0.12)",
                  outline: selectedColor === i ? "2.5px solid #d97706" : "2.5px solid transparent",
                  outlineOffset: "3px",
                  transition: "outline 0.15s ease",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
