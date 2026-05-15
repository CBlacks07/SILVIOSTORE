"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, close, updateQuantity, removeItem, subtotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!mounted) return null;

  const total = subtotal();


  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.60)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.3s ease",
          cursor: "pointer",
        }}
      />

      {/* Drawer */}
      <aside
        style={{
          position: "absolute", right: 0, top: 0,
          height: "100%", width: "100%", maxWidth: "448px",
          display: "flex", flexDirection: "column",
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="flex h-16 items-center justify-between border-b border-brand-100 px-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-900" />
            <h2 className="font-semibold text-brand-950">Mon panier ({items.length})</h2>
          </div>
          <button onClick={close} className="rounded p-2 text-brand-700 transition-colors hover:bg-brand-50" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-brand-300" />
            <p className="mt-4 text-brand-700">Votre panier est vide</p>
            <Link href="/catalogue" onClick={close} className="btn-primary mt-6">
              Voir les accessoires
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((item) => (
                <div
                  key={item.productId + (item.variantLabel || "")}
                  className="flex gap-3 border-b border-brand-100 pb-4 last:border-0"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-white ring-1 ring-brand-100">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={"/produit/" + item.slug}
                      onClick={close}
                      className="line-clamp-2 text-sm font-medium text-brand-950 transition-colors hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel && <p className="mt-0.5 text-xs text-brand-500">{item.variantLabel}</p>}
                    <p className="mt-1 text-sm font-semibold text-brand-900">{formatPrice(item.unitPrice)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded border border-brand-200">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantLabel)}
                          className="p-1.5 text-brand-700 transition-colors hover:bg-brand-50"
                          aria-label="Diminuer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantLabel)}
                          className="p-1.5 text-brand-700 transition-colors hover:bg-brand-50"
                          aria-label="Augmenter"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.variantLabel)}
                        className="text-brand-400 transition-colors hover:text-red-600"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-brand-100 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-700">Sous-total</span>
                <span className="text-lg font-semibold text-brand-950">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-brand-500">Frais de livraison calculés au paiement.</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/checkout" onClick={close} className="btn-primary">
                  Passer au paiement
                </Link>
                <Link href="/catalogue" onClick={close} className="btn-outline">
                  Continuer mes achats
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body
  );
}
