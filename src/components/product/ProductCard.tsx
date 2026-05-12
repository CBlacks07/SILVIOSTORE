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
      className="group card overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square w-full overflow-hidden border-b border-brand-100" style={{ background: "rgb(245,247,250)" }}>
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-brand-300 text-xs">
            Aucune image
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {discount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent text-white shadow-sm">
              -{discount}%
            </span>
          )}
        </div>

        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          {outOfStock ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 ring-1 ring-rose-200">
              Rupture
            </span>
          ) : lowStock ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 ring-1 ring-amber-200">
              Stock faible
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        {product.brand && (
          <span className="text-[11px] uppercase tracking-wider text-brand-500 font-medium">{product.brand}</span>
        )}
        <h3 className="mt-1 font-medium text-brand-950 line-clamp-2 leading-snug group-hover:text-accent transition">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-3 flex items-baseline gap-2">
          <span className="text-base font-semibold text-brand-950">{formatPrice(product.price)}</span>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <span className="text-xs text-brand-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="mt-2 text-[11px] text-rose-600 font-medium">
            Rupture de stock
          </div>
        )}
      </div>
    </Link>
  );
}
