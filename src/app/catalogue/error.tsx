"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function CatalogueError({ reset }: { reset: () => void }) {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-sm font-semibold text-accent mb-2">Erreur de chargement</p>
      <h1 className="font-display text-2xl font-bold text-brand-950 mb-3">Le catalogue ne répond pas</h1>
      <p className="text-brand-500 text-sm mb-8">Vérifiez votre connexion et réessayez.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:border-accent hover:text-accent transition-all">
          <RefreshCw className="h-4 w-4" /> Réessayer
        </button>
        <Link href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-all">
          Accueil
        </Link>
      </div>
    </div>
  );
}
