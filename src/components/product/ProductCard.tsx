import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { WishlistButton } from "./WishlistButton";
import { ProductCardImage } from "./ProductCardImage";

const COLOR_MAP: Record<string, string> = {
  // Noirs
  noir: "#1a1a1a", black: "#1a1a1a", "noir mat": "#1a1a1a", "noir brillant": "#0a0a0a",
  "noir carbone": "#1c1c1e", "midnight": "#1c1c1e",

  // Blancs & crèmes
  blanc: "#f5f5f5", white: "#f5f5f5", "blanc nacré": "#f0ece4", "blanc mat": "#f8f8f8",
  ivoire: "#fffff0", ivory: "#fffff0", crème: "#fffdd0", cream: "#fffdd0",
  "starlight": "#f2ede4",

  // Gris
  gris: "#9ca3af", grey: "#9ca3af", gray: "#9ca3af",
  "gris clair": "#d1d5db", "gris foncé": "#374151", "gris anthracite": "#2d2d2d",
  anthracite: "#2d2d2d", graphite: "#404040", titane: "#8a8a8e", titanium: "#8a8a8e",
  "gris titane": "#8a8a8e", "space gray": "#6e6e73", "storm blue": "#4c5f70",

  // Bleus
  bleu: "#2563eb", blue: "#2563eb",
  "bleu marine": "#1e3a5f", navy: "#1e3a5f", "bleu nuit": "#1e2a4a",
  marine: "#000080",
  "bleu ciel": "#38bdf8", "bleu clair": "#7dd3fc", "bleu glacier": "#bae6fd",
  "bleu roi": "#1d4ed8", cobalt: "#0047ab",
  turquoise: "#06b6d4", cyan: "#06b6d4",
  indigo: "#4338ca",
  "sierra blue": "#69a5c1", "alpine green": "#4a6741",

  // Verts
  vert: "#16a34a", green: "#16a34a",
  "vert forêt": "#14532d", "vert olive": "#6b7c45", olive: "#6b7c45",
  "vert militaire": "#4a5240", kaki: "#78866b", khaki: "#78866b",
  "vert menthe": "#6ee7b7", menthe: "#6ee7b7", mint: "#6ee7b7",
  "vert sauge": "#84a98c", sauge: "#84a98c", sage: "#84a98c",
  emeraude: "#047857", emerald: "#047857",

  // Rouges
  rouge: "#dc2626", red: "#dc2626",
  bordeaux: "#7f1d1d", burgundy: "#7f1d1d", wine: "#722f37",
  "rouge bordeaux": "#7f1d1d", "rouge foncé": "#991b1b",
  corail: "#f87171", coral: "#f87171",
  tomate: "#e8432d",

  // Roses
  rose: "#f472b6", pink: "#f472b6",
  "rose clair": "#fbcfe8", "rose pâle": "#fce7f3",
  "rose gold": "#e8a09a", "rose vif": "#ec4899",
  "rose bonbon": "#ff69b4", "rose poudré": "#f4b8b8",
  saumon: "#fa8072", salmon: "#fa8072",
  pêche: "#ffb347", peach: "#ffb347",

  // Violets
  violet: "#7c3aed", purple: "#7c3aed",
  mauve: "#c084fc", lavande: "#a78bfa", lavender: "#a78bfa",
  lilas: "#c4b5fd", lilac: "#c4b5fd",
  prune: "#581c87", aubergine: "#4a1942", "deep purple": "#4a0e8f",

  // Jaunes & oranges
  jaune: "#eab308", yellow: "#eab308",
  "jaune citron": "#fde047", citron: "#fde047",
  "jaune doré": "#f59e0b", miel: "#f59e0b", honey: "#f59e0b",
  orange: "#f97316", "orange brûlé": "#c2410c",

  // Marrons & terres
  marron: "#92400e", brown: "#92400e",
  caramel: "#c47c45", café: "#6f4e37", coffee: "#6f4e37",
  "marron chocolat": "#654321", "chocolat marron": "#654321",
  chocolat: "#3d1a00", chocolate: "#3d1a00",
  terracotta: "#cc4e2a", "terre cuite": "#cc4e2a",
  nude: "#e8c9a0", sand: "#d4b896",

  // Beiges
  beige: "#d4b896", "beige rosé": "#e8c4a0", champagne: "#f7e7ce",

  // Métaux
  argent: "#d1d5db", silver: "#d1d5db",
  or: "#d97706", gold: "#d97706", doré: "#d97706",
  "or clair": "#d4af37", "doré clair": "#d4af37", "or jaune": "#d4af37",
  "or foncé": "#b8860b", "vieil or": "#b8860b",
  bronze: "#cd7f32", copper: "#b87333", cuivre: "#b87333",

  // Spéciaux
  transparent: "rgba(200,200,200,0.25)",
  "transparente": "rgba(200,200,200,0.25)",
  multicolore: "linear-gradient(135deg,#ff6b6b,#4ecdc4,#45b7d1,#96ceb4)",
  holographique: "linear-gradient(135deg,#ff9a9e,#a18cd1,#fbc2eb,#a6c1ee)",
  irisé: "linear-gradient(135deg,#ff9a9e,#a18cd1,#fbc2eb)",
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

  const outOfStock = product.stock <= 0;
  const colorOptions = getColorOptions(product);

  return (
    <div className="relative group bg-white rounded-2xl border border-brand-100/60 hover:border-brand-200 hover:shadow-lg transition-all duration-300">

      <WishlistButton productId={product.id} />

      {/* Image + swatches interactifs (client component) */}
      <ProductCardImage
        images={product.images ?? []}
        alt={product.name}
        discount={discount}
        outOfStock={outOfStock}
        colorOptions={colorOptions}
      />

      <Link href={"/produit/" + product.slug} className="flex flex-col">
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

    </div>
  );
}
