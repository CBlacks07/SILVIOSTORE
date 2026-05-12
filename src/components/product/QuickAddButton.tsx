"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    images?: string[] | null;
  };
  className?: string;
};

export function QuickAddButton({ product, className }: Props) {
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  function onAdd() {
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
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <button type="button" onClick={onAdd} className={className || "btn-primary"}>
      {added ? (
        <>
          <Check className="h-4 w-4" />
          Ajouté
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          Ajouter
        </>
      )}
    </button>
  );
}

