"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

type BundleProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  images?: string[] | null;
};

export function AddBundleButton({ products }: { products: BundleProduct[] }) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const total = products.reduce((sum, p) => sum + p.price, 0);

  function onAddAll() {
    for (const p of products) {
      addItem({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: p.images?.[0] ?? null,
        unitPrice: p.price,
        quantity: 1,
        variantLabel: ""
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <button type="button" onClick={onAddAll} className="btn-primary">
      {added ? (
        <>
          <Check className="h-4 w-4" />
          Tout ajouté
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          Ajouter tout ({formatPrice(total)})
        </>
      )}
    </button>
  );
}

