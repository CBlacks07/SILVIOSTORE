"use client";

import Link from "next/link";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  X,
  ChevronRight,
  Package,
  MapPin,
  User,
  Phone,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "./hooks/useSearch";
import type { Category } from "@/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  siteName: string;
  logoUrl?: string;
  phone: string;
  mounted: boolean;
  categories: Pick<Category, "slug" | "name">[];
};

export function HeaderMobileMenu({
  isOpen,
  onClose,
  siteName,
  logoUrl,
  phone,
  mounted,
  categories,
}: Props) {
  const { q, setQ, suggestions } = useSearch();

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 lg:hidden mobile-menu-overlay" style={{ zIndex: 1000 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-950/80 backdrop-blur-md"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-brand-100 shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <span className="font-display font-black text-lg tracking-tighter text-brand-950">
                  {siteName.toUpperCase()}
                </span>
              )}
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-brand-400 hover:text-brand-950 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 bg-brand-50/50 border-b border-brand-100">
              <form action="/catalogue" className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
                <input
                  type="search"
                  name="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Chercher un article..."
                  className="w-full h-11 bg-white border border-brand-100 rounded-xl pl-10 pr-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-all"
                />
              </form>

              {/* Search Suggestions */}
              <AnimatePresence>
                {(suggestions.products.length > 0 ||
                  suggestions.categories.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-4 right-4 top-full mt-2 bg-white rounded-xl shadow-2xl border border-brand-100 overflow-hidden z-[110] p-1"
                  >
                    {suggestions.categories.slice(0, 3).map((c) => (
                      <Link
                        key={c.slug}
                        href={`/catalogue?categorie=${c.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between px-3 py-2 text-xs text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        {c.name}
                        <ChevronRight className="h-3 w-3 opacity-30" />
                      </Link>
                    ))}
                    {suggestions.products.slice(0, 5).map((p) => (
                      <Link
                        key={p.slug}
                        href={`/produit/${p.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 p-2 hover:bg-brand-50 rounded-lg transition-colors border-t border-brand-50 first:border-0"
                      >
                        <Search className="h-3 w-3 text-brand-300" />
                        <span className="text-xs text-brand-800 truncate">
                          {p.name}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
              {/* Main Menu */}
              <div className="space-y-1 mb-8">
                <p className="px-2 mb-3 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                  Menu
                </p>
                <Link
                  href="/catalogue"
                  onClick={onClose}
                  className="flex items-center justify-between px-4 py-3 text-brand-900 font-bold hover:bg-brand-50 rounded-xl transition-colors"
                >
                  Tout le catalogue
                  <ChevronRight className="h-4 w-4 opacity-30" />
                </Link>
                <Link
                  href="/compte/commandes"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                >
                  <Package className="h-5 w-5 opacity-40" />
                  Mes commandes
                </Link>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <p className="px-2 mb-3 text-[10px] font-bold text-brand-400 uppercase tracking-widest">
                  Catégories
                </p>
                <div className="space-y-1">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/catalogue?categorie=${c.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-3 text-brand-800 font-bold hover:bg-brand-50 rounded-xl transition-colors"
                    >
                      {c.name}
                      <ChevronRight className="h-4 w-4 opacity-20" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account Links */}
              <div className="border-t border-brand-100 pt-6 space-y-1">
                <Link
                  href="/compte"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                >
                  <User className="h-5 w-5 opacity-40" />
                  Mon profil
                </Link>
                <Link
                  href="/compte/adresses"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-brand-700 hover:bg-brand-50 rounded-xl transition-colors"
                >
                  <MapPin className="h-5 w-5 opacity-40" />
                  Adresses
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gradient-to-t from-brand-50/50 to-transparent border-t border-brand-100 mt-auto">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 text-brand-900 font-bold"
              >
                <div className="h-10 w-10 bg-white border border-brand-100 rounded-full flex items-center justify-center text-accent shadow-sm">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm">{phone}</p>
                  <p className="text-[10px] text-brand-500 font-medium">
                    Aide & WhatsApp
                  </p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
