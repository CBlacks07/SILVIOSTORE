"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";

type Props = {
  siteName: string;
  logoUrl?: string;
  onMobileMenuOpen: () => void;
};

export function HeaderLogo({ siteName, logoUrl, onMobileMenuOpen }: Props) {
  return (
    <div className="flex items-center gap-4 shrink-0">
      {/* Mobile Menu Button - HIDDEN on desktop */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 text-white hover:text-accent transition-colors duration-200"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <Link href="/" className="flex items-center">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={siteName}
            className="h-14 md:h-16 w-auto max-w-[200px] md:max-w-[280px] object-contain"
          />
        ) : (
          <span className="font-display text-lg lg:text-xl font-black text-white tracking-tight hover:text-accent transition-colors duration-200 whitespace-nowrap">
            {siteName.toUpperCase()}
          </span>
        )}
      </Link>
    </div>
  );
}
