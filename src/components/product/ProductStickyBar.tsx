"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductStickyBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const outOfStock = product.stock <= 0;

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? null,
      unitPrice: product.price,
      quantity: 1,
      variantLabel: ""
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      aria-hidden={!visible}
      className={
        "fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur transition-transform duration-300 lg:hidden " +
        (visible ? "translate-y-0" : "translate-y-full")
      }
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="container-page flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] uppercase tracking-wide text-brand-500">{product.name}</p>
          <p className="font-bold text-brand-950">{formatPrice(product.price)}</p>
        </div>
        <button type="button" disabled={outOfStock} onClick={handleAdd} className="btn-accent">
          {added ? (
            <>
              <Check className="h-4 w-4" />
              Ajouté
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {outOfStock ? "Indisponible" : "Ajouter"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
