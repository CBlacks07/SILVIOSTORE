"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <div className="container-page py-24 flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-950 mb-2">Produit indisponible</h1>
        <p className="text-brand-500 text-sm mb-8 leading-relaxed">
          Ce produit ne peut pas s&apos;afficher pour le moment. Réessayez ou parcourez le catalogue.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:border-accent hover:text-accent transition-all">
            <RefreshCw className="h-4 w-4" /> Réessayer
          </button>
          <Link href="/catalogue"
            className="inline-flex items-center gap-2 rounded-xl bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all">
            Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
