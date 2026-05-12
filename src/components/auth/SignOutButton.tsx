"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const AUTH_EVENT_KEY = "silvio-auth:event";

export function SignOutButton({ className, children }: { className: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function confirmSignOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify({ type: "logout", at: Date.now() }));
    setOpen(false);
    window.location.assign("/");
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4"
          onClick={() => (busy ? undefined : setOpen(false))}
        >
          <div
            className="w-[420px] max-w-full rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-brand-950">Confirmer la déconnexion</h3>
            <p className="mt-2 text-sm text-brand-600">Voulez-vous vraiment vous déconnecter ?</p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={confirmSignOut}
                disabled={busy}
              >
                {busy ? "Déconnexion..." : "Se déconnecter"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
