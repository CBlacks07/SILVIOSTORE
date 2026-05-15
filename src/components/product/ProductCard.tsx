// ProductCard améliorée — hover lift, stock badge, better spacing
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const cover = product.images?.[0];
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock < 5;

  return (
    <Link 
      href={"/produit/" + product.slug} 
      className="product-card group flex flex-col bg-white h-full rounded-2xl overflow-hidden"
    >
      <div className="relative aspect-square w-full bg-brand-50 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-brand-300 text-xs">
            Aucune image
          </div>
        )}
        
        {/* Badges */}
        {discount && discount > 0 && discount <= 95 && (
          <div className="absolute left-2 top-2 z-10">
            <span
              className="text-[10px] font-black"
              style={{ background: "#d97706", color: "#fff", padding: "2px 8px", borderRadius: "999px", display: "inline-block" }}
            >
              -{discount}%
            </span>
          </div>
        )}

        <div className="absolute right-2.5 top-2.5 z-10">
          {outOfStock && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-sm ring-1 ring-white/20">
              Rupture
            </span>
          )}
        </div>
      </div>

      <div className="p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col gap-1.5">
        {product.brand && (
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-brand-400 font-black">{product.brand}</span>
        )}
        <h3 className="font-semibold text-brand-950 line-clamp-2 leading-snug group-hover:text-accent transition-colors text-[11px] sm:text-xs md:text-sm lg:text-base flex-1">
          {product.name}
        </h3>

        <div className="flex items-end justify-between gap-1 pt-1.5 border-t border-brand-50">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm md:text-base font-black text-brand-950 tabular-nums">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-[9px] sm:text-[10px] text-brand-300 line-through tabular-nums">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
          {outOfStock && (
            <span className="text-[9px] font-bold text-rose-500 shrink-0">Rupture</span>
          )}
          {lowStock && !outOfStock && (
            <span className="text-[9px] font-bold text-amber-600 shrink-0">Derniers</span>
          )}
        </div>
      </div>
    </Link>
  );
}
