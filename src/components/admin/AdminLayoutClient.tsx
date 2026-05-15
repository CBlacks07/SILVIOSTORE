"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

type Props = {
  user: { email: string; full_name?: string | null };
  pendingOrders: number;
  pendingReviews: number;
  children: React.ReactNode;
};

export function AdminLayoutClient({ user, pendingOrders, pendingReviews, children }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen bg-brand-50/50">

      {/* ── Desktop sidebar (always visible ≥ lg) ── */}
      <div className="hidden lg:block">
        <AdminSidebar user={user} pendingOrders={pendingOrders} pendingReviews={pendingReviews} />
      </div>

      {/* ── Mobile portal drawer ── */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9000,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(2px)",
              opacity: open ? 1 : 0,
              pointerEvents: open ? "auto" : "none",
              transition: "opacity 0.25s ease",
            }}
          />
          {/* Drawer */}
          <div
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0,
              zIndex: 9001,
              width: "min(280px, 85vw)",
              background: "#fff",
              boxShadow: "4px 0 32px rgba(0,0,0,0.18)",
              transform: open ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
              overflowY: "auto",
            }}
          >
            <AdminSidebar
              user={user}
              pendingOrders={pendingOrders}
              pendingReviews={pendingReviews}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </>,
        document.body
      )}

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-brand-100 sticky top-0 z-40">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-brand-700 hover:bg-brand-50 transition-colors"
            aria-label="Menu admin"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-display font-bold text-sm text-brand-950">Admin</div>
        </div>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
