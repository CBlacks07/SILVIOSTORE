"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users,
  Settings, Tags, Megaphone, BadgePercent, Star, Search,
  ChevronRight, ChevronsUpDown, ExternalLink, ImageIcon
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: 'Vue générale',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/produits',   label: 'Produits',   icon: Package },
      { href: '/admin/categories', label: 'Catégories', icon: FolderTree },
      { href: '/admin/marques',    label: 'Marques',    icon: Tags },
    ],
  },
  {
    label: 'Ventes',
    items: [
      { href: '/admin/commandes',  label: 'Commandes',    icon: ShoppingCart, badgeTone: 'amber' },
      { href: '/admin/promotions', label: 'Codes promo',  icon: BadgePercent },
      { href: '/admin/avis',       label: 'Avis clients', icon: Star, badgeTone: 'rose' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/bibliotheque', label: 'Bibliothèque', icon: ImageIcon },
      { href: '/admin/bannieres',   label: 'Bannières',    icon: Megaphone },
      { href: '/admin/parametres',  label: 'Paramètres',   icon: Settings },
    ],
  },
  {
    label: 'Équipe',
    items: [
      { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
    ],
  },
];

export function AdminSidebar({
  user,
  pendingOrders = 0,
  pendingReviews = 0,
}: {
  user: { email: string; full_name?: string | null };
  pendingOrders?: number;
  pendingReviews?: number;
}) {
  const pathname = usePathname();

  const badges: Record<string, string | undefined> = {
    "/admin/commandes": pendingOrders > 0 ? String(pendingOrders) : undefined,
    "/admin/avis":      pendingReviews > 0 ? String(pendingReviews) : undefined,
  };
  const initials = user.full_name?.split(' ').map(p => p[0]).slice(0,2).join('') || 'SA';

  return (
    <aside className="w-[256px] shrink-0 bg-white border-r border-brand-100 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-brand-100 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-brand-950 text-white grid place-items-center font-display font-bold text-sm">S</div>
        <div className="min-w-0">
          <div className="font-display font-bold text-sm text-brand-950 leading-tight truncate">SILVIO STORE</div>
          <div className="text-[10px] uppercase tracking-wider text-brand-400 leading-tight">Console admin</div>
        </div>
      </div>

      {/* Search — flex layout to avoid icon/text overlap */}
      <div className="p-3 border-b border-brand-100">
        <div className="flex items-center gap-2 h-9 rounded-md bg-brand-50 border border-transparent px-3 focus-within:bg-white focus-within:border-brand-300 transition-colors">
          <Search className="h-4 w-4 text-brand-400 shrink-0" />
          <input
            placeholder="Rechercher…"
            className="flex-1 min-w-0 bg-transparent border-0 text-sm placeholder-brand-400 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-brand-200 text-brand-500 shrink-0">⌘K</kbd>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-brand-400">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((it) => {
                const isActive = pathname === it.href;
                const Icon = it.icon;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={
                      'w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition relative ' +
                      (isActive
                        ? 'bg-brand-950 text-white shadow-sm'
                        : 'text-brand-700 hover:bg-brand-50')
                    }
                  >
                    <Icon className={'h-[18px] w-[18px] ' + (isActive ? 'text-white' : 'text-brand-500')} />
                    <span className="flex-1 truncate">{it.label}</span>
                    {badges[it.href] && (
                      <span className={
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full ' +
                        (isActive
                          ? 'bg-white/15 text-white'
                          : it.badgeTone === 'amber'
                            ? 'bg-amber-100 text-amber-800'
                            : it.badgeTone === 'rose'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-brand-100 text-brand-700')
                      }>
                        {badges[it.href]}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="border-t border-brand-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-brand-50 cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 text-white grid place-items-center font-semibold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-brand-950 truncate leading-tight">{user.full_name || 'Admin'}</div>
            <div className="text-[11px] text-brand-500 truncate leading-tight">{user.email}</div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-brand-400" />
        </div>
        <Link href="/" className="mt-2 flex items-center gap-2 text-xs text-brand-500 hover:text-brand-900 px-2 py-1.5 rounded">
          <ExternalLink className="h-3.5 w-3.5" />
          Voir la boutique →
        </Link>
      </div>
    </aside>
  );
}
