import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { WishlistButton } from "./WishlistButton";

const COLOR_MAP: Record<string, string> = {
  noir: "#1a1a1a", black: "#1a1a1a",
  blanc: "#f5f5f5", white: "#f5f5f5",
  bleu: "#2563eb", blue: "#2563eb",
  "bleu marine": "#1e3a5f", navy: "#1e3a5f",
  "bleu ciel": "#38bdf8", "bleu clair": "#38bdf8",
  rouge: "#dc2626", red: "#dc2626",
  rose: "#ec4899", pink: "#ec4899",
  "rose gold": "#e8a09a",
  violet: "#7c3aed", purple: "#7c3aed",
  mauve: "#a855f7",
  vert: "#16a34a", green: "#16a34a",
  "vert militaire": "#4a5240",
  jaune: "#eab308", yellow: "#eab308",
  orange: "#f97316",
  gris: "#6b7280", grey: "#6b7280", gray: "#6b7280",
  "gris foncé": "#374151",
  argent: "#d1d5db", silver: "#d1d5db",
  or: "#d97706", gold: "#d97706", doré: "#d97706",
  marron: "#92400e", brown: "#92400e",
  beige: "#d4b896",
  transparent: "rgba(200,200,200,0.3)",
};

export function resolveColor(value: string): string {
  if (/^#[0-9a-f]{3,6}$/i.test(value)) return value;
  return COLOR_MAP[value.toLowerCase().trim()] ?? "#9ca3af";
}

export function getColorOptions(product: Product) {
  const colorVariant = product.variants?.find((v) =>
    /couleur|color|colour/i.test(v.name)
  );
  if (colorVariant?.options?.length) {
    return colorVariant.options
      .filter((o) => o.stock > 0)
      .map((o) => ({ label: o.label, value: o.value || o.label }));
  }
  const colorSpec = product.specifications?.find((s) =>
    /couleur|color|colour/i.test(s.label)
  );
  if (colorSpec?.value) {
    return colorSpec.value
      .split(/[,;]/)
      .map((v) => ({ label: v.trim(), value: v.trim() }))
      .filter((v) => v.label.length > 0);
  }
  return [];
}

export function ColorSwatches({ slug, colorOptions, max = 5, size = 18 }: {
  slug: string;
  colorOptions: { label: string; value: string }[];
  max?: number;
  size?: number;
}) {
  if (colorOptions.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {colorOptions.slice(0, max).map((opt, i) => (
        <Link
          key={i}
          href={`/produit/${slug}?couleur=${encodeURIComponent(opt.label)}`}
          title={opt.label}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "999px",
            background: resolveColor(opt.value || opt.label),
            border: "2px solid rgba(0,0,0,0.12)",
            display: "inline-block",
            flexShrink: 0,
            transition: "transform 0.15s ease",
          }}
          className="hover:scale-125"
        />
      ))}
      {colorOptions.length > max && (
        <span className="text-[10px] font-bold text-brand-400">
          +{colorOptions.length - max}
        </span>
      )}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const cover = product.images?.[0];
  const outOfStock = product.stock <= 0;
  const colorOptions = getColorOptions(product);

  return (
    <div className="relative group bg-white rounded-2xl border border-brand-100/60 hover:border-brand-200 hover:shadow-lg transition-all duration-300">

      <WishlistButton productId={product.id} />

      <Link href={"/produit/" + product.slug} className="flex flex-col">
        {/* Image — overflow-hidden uniquement ici */}
        <div className="relative aspect-square w-full bg-brand-50 overflow-hidden rounded-t-2xl">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
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

        {/* Info */}
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

      {/* Swatches — EN DEHORS du Link, pas clippées */}
      {colorOptions.length > 0 && (
        <div className="px-3 pb-3 md:px-4 md:pb-4">
          <ColorSwatches slug={product.slug} colorOptions={colorOptions} />
        </div>
      )}
    </div>
  );
}
