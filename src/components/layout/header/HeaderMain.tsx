"use client";

import { HeaderLogo } from "./HeaderLogo";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderActions } from "./HeaderActions";
import { useHeaderScroll } from "./hooks/useHeaderScroll";
import type { Category } from "@/lib/types";

type Props = {
  siteName: string;
  logoUrl?: string;
  totalItems: number;
  hydrated: boolean;
  categories: Pick<Category, "slug" | "name">[];
  onMobileMenuOpen: () => void;
  onCartOpen: () => void;
};

export function HeaderMain({
  siteName,
  logoUrl,
  totalItems,
  hydrated,
  categories,
  onMobileMenuOpen,
  onCartOpen,
}: Props) {
  const { scrolled, visible } = useHeaderScroll();

  return (
    <header 
      className="sticky top-0 w-full transition-shadow duration-300"
      style={{
        top: 0,
        zIndex: 500,
        background: "#0f172a",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.4)" : "none",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-page">
        {/* Main Row: Logo | Search | Actions */}
        <div className="flex items-center justify-between gap-4 py-3 md:py-5">
          {/* Logo */}
          <div className="shrink-0">
            <HeaderLogo siteName={siteName} logoUrl={logoUrl} onMobileMenuOpen={onMobileMenuOpen} />
          </div>

          {/* Search - centred, max width - HIDDEN ON MOBILE/TABLET via custom CSS class */}
          <div className="header-search-container flex-1 min-w-0 items-center justify-center px-4">
            <div className="w-full max-w-2xl">
              <HeaderSearch />
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0">
            <HeaderActions
              totalItems={totalItems}
              hydrated={hydrated}
              onCartOpen={onCartOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
