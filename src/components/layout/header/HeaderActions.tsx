"use client";

import Link from "next/link";
import { User, ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";

type Props = {
  totalItems: number;
  hydrated: boolean;
  onCartOpen: () => void;
};

export function HeaderActions({ totalItems, hydrated, onCartOpen }: Props) {
  const wishlistCount = useWishlist((s) => s.items.length);

  return (
    <div className="flex items-center gap-6 shrink-0">
      {/* Cart */}
      <button
        onClick={onCartOpen}
        className="group relative p-2.5 text-white hover:text-accent transition-all duration-300"
        title="Panier"
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-lg transition-all duration-300" />
        <ShoppingBag className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
        {hydrated && totalItems > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-accent text-brand-950 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
            {totalItems}
          </span>
        )}
      </button>

      {/* Wishlist */}
      <Link
        href="/wishlist"
        className="group relative p-2.5 text-white hover:text-accent transition-all duration-300"
        title="Liste de souhaits"
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-lg transition-all duration-300" />
        <Heart className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
        {hydrated && wishlistCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-accent text-brand-950 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
            {wishlistCount}
          </span>
        )}
      </Link>

      {/* Account */}
      <Link
        href="/compte"
        className="group relative p-2.5 text-white hover:text-accent transition-all duration-300"
        title="Mon compte"
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-lg transition-all duration-300" />
        <User className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
      </Link>
    </div>
  );
}
