"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { resolveColor } from "./ProductCard";
import type { Product } from "@/lib/types";

type ColorOption = { label: string; value: string };

type Props = {
  product: Product;
  discount: number | null;
  outOfStock: boolean;
  colorOptions: ColorOption[];
};

export function ProductCardClient({ product, discount, outOfStock, colorOptions }: Props) {
  const [selectedColor, setSelectedColor] = useState(0);

  const images = product.images ?? [];
  const cover = images[selectedColor] ?? images[0];

  return (
    <>
      <Link href={"/produit/" + product.slug} className="flex flex-col">
        {/* Image */}
        <div className="relative aspect-square w-full bg-brand-50 overflow-hidden rounded-t-2xl">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
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

        {/* Marque + Nom + Prix */}
        <div className="p-3 md:p-4 flex flex-col gap-1">
          {product.brand && (
            <span className="text-[9px] uppercase tracking-widest text-accent font-black">{product.brand}</span>
          )}
          <h3 className="text-xs md:text-sm font-semibold text-brand-950 line-clamp-2 leading-snug group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm md:text-base font-black text-brand-950 tabular-nums">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[10px] text-brand-300 line-through tabular-nums">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Swatches indépendants — en dehors du lien */}
      {colorOptions.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 pb-3 md:px-4 flex-wrap">
          {colorOptions.slice(0, 6).map((opt, i) => (
            <button
              key={i}
              type="button"
              title={opt.label}
              onClick={() => setSelectedColor(i)}
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "999px",
                background: resolveColor(opt.value || opt.label),
                flexShrink: 0,
                cursor: "pointer",
                border: "2px solid rgba(0,0,0,0.12)",
                outline: selectedColor === i ? "2px solid #d97706" : "2px solid transparent",
                outlineOffset: "2px",
                transition: "outline 0.15s ease",
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
