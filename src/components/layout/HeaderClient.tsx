"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { HeaderTopBar } from "./header/HeaderTopBar";
import { HeaderMain } from "./header/HeaderMain";
import { HeaderMobileMenu } from "./header/HeaderMobileMenu";
import type { Category } from "@/lib/types";

type Props = {
  siteName: string;
  phone: string;
  headerStrip: { enabled: boolean; text: string };
  categories: Pick<Category, "slug" | "name">[];
};

export function HeaderClient({
  siteName,
  phone,
  headerStrip,
  categories,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = useCart((s) => s.totalItems());
  const openCart = useCart((s) => s.open);

  // Hydration & Mount
  useEffect(() => {
    setHydrated(true);
    setMounted(true);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top Bar */}
      <HeaderTopBar
        enabled={headerStrip.enabled}
        text={headerStrip.text}
        phone={phone}
      />

      {/* Main Header */}
      <HeaderMain
        siteName={siteName}
        totalItems={totalItems}
        hydrated={hydrated}
        categories={categories}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
        onCartOpen={openCart}
      />

      {/* Mobile Menu */}
      <HeaderMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        siteName={siteName}
        phone={phone}
        mounted={mounted}
        categories={categories}
      />

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
