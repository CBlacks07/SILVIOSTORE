import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const cover = product.images?.[0];
  const outOfStock = product.stock <= 0;

  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden border border-brand-100/60 hover:border-brand-200 hover:shadow-lg transition-all duration-300">

      {/* Bouton cœur — EN DEHORS du Link, pas de conflit de navigation */}
      <WishlistButton productId={product.id} />

      <Link href={"/produit/" + product.slug} className="flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square w-full bg-brand-50 overflow-hidden">
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
    </div>
  );
}
