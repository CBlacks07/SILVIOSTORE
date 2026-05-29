"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { useProductColor } from "@/store/productColor";
import type { Product } from "@/lib/types";

export function AddToCartForm({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState<string>("");
  const [added, setAdded] = useState(false);
  const addItem = useCart((s) => s.addItem);

  // Couleur + image sélectionnées via les swatches
  const selectedColorLabel = useProductColor((s) =>
    s.productId === product.id ? s.label : ""
  );
  const selectedColorImage = useProductColor((s) =>
    s.productId === product.id ? s.image : null
  );

  const variantsGroup = product.variants?.[0];
  const hasVariants = !!variantsGroup && variantsGroup.options.length > 0;
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    if (hasVariants && !variant) return;
    // Utilise la couleur sélectionnée si pas de variante classique
    const finalVariant = variant || selectedColorLabel || "";
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: selectedColorImage ?? product.images?.[0] ?? null,
      unitPrice: product.price,
      quantity: qty,
      variantLabel: finalVariant
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      {hasVariants && (
        <div>
          <label className="block text-sm font-medium text-brand-900 mb-2">{variantsGroup!.name}</label>
          <div className="flex flex-wrap gap-2">
            {variantsGroup!.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVariant(opt.label)}
                className={
                  "rounded-md border px-3 py-1.5 text-sm " +
                  (variant === opt.label
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-brand-200 text-brand-800 hover:border-brand-400")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="inline-flex items-center rounded-md border border-brand-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="p-2.5 text-brand-700 hover:bg-brand-50"
            aria-label="Diminuer"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min(product.stock, qty + 1))}
            disabled={qty >= product.stock}
            className="p-2.5 text-brand-700 hover:bg-brand-50 disabled:opacity-40"
            aria-label="Augmenter"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className="btn-accent flex-1"
          style={{
            transition: "all 0.25s cubic-bezier(0.22,1,0.36,1)",
            transform: added ? "scale(1.03)" : "scale(1)",
            background: added ? "linear-gradient(135deg, #16a34a, #22c55e)" : undefined,
          }}
        >
          {added ? (
            <span style={{ display: "flex", alignItems: "center", gap: "8px", animation: "fadeInUp 0.2s ease" }}>
              <Check className="h-4 w-4" />
              Ajouté !
            </span>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              {outOfStock ? "Indisponible" : "Ajouter au panier"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

