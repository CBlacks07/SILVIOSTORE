"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

type Props = {
  siteName: string;
  onMobileMenuOpen: () => void;
};

export function HeaderLogo({ siteName, onMobileMenuOpen }: Props) {
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
      <Link
        href="/"
        className="hover:text-accent transition-colors duration-200 whitespace-nowrap"
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "clamp(15px, 1.4vw, 19px)",
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: "#d97706",
          textDecoration: "none",
        }}
      >
        {siteName.toUpperCase()}
      </Link>
    </div>
  );
}
