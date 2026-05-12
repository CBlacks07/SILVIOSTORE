"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { QuickAddButton } from "@/components/product/QuickAddButton";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images: string[] | null;
};

export function CartRecommendations({ productIds }: { productIds: string[] }) {
  const ids = useMemo(() => Array.from(new Set(productIds)).filter(Boolean), [productIds]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }
    const controller = new AbortController();
    fetch("/api/recommendations/cart?ids=" + ids.join(","), { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProducts(data?.products || []))
      .catch(() => {});
    return () => controller.abort();
  }, [ids]);

  if (products.length === 0) return null;

  return (
    <div className="border-t border-brand-100 p-5">
      <h3 className="mb-3 text-sm font-semibold text-brand-950">Souvent achetés ensemble</h3>
      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-brand-100 p-2">
            <div className="h-14 w-14 overflow-hidden rounded bg-white ring-1 ring-brand-100">
              {p.images?.[0] ? (
                <Image src={p.images[0]} alt={p.name} width={56} height={56} className="h-full w-full object-contain p-1" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={"/produit/" + p.slug} className="line-clamp-1 text-sm font-medium text-brand-900 hover:text-accent">
                {p.name}
              </Link>
              <p className="text-xs text-brand-600">{formatPrice(p.price)}</p>
            </div>
            <QuickAddButton product={p} className="btn-outline h-9 px-3 text-xs" />
          </div>
        ))}
      </div>
    </div>
  );
}

