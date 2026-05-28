import Link from "next/link";
import { Search, Home, ShoppingBag, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-24" style={{ background: "linear-gradient(135deg, rgb(250,248,245) 0%, rgb(255,255,255) 100%)" }}>
      <div className="max-w-lg w-full text-center">

        {/* 404 graphique */}
        <div className="relative mb-10 select-none">
          <span
            className="font-display font-black text-brand-100 block leading-none"
            style={{ fontSize: "clamp(120px, 25vw, 200px)", letterSpacing: "-0.05em" }}
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{
              width: "80px", height: "80px", borderRadius: "20px",
              background: "linear-gradient(135deg, #d97706, #f59e0b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 12px 40px rgba(217,119,6,0.35)",
            }}>
              <Search size={36} color="#fff" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Texte */}
        <p className="text-[11px] font-black uppercase tracking-widest text-accent mb-3">
          Page introuvable
        </p>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-950 mb-3 leading-snug">
          On ne trouve pas ce que vous cherchez
        </h1>
        <p className="text-brand-500 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          La page a peut-être été déplacée ou supprimée. Parcourez notre catalogue pour découvrir nos accessoires premium.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #1a1008, #2c1c06)" }}>
            <Home size={16} /> Accueil
          </Link>
          <Link href="/catalogue" className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-brand-950 border border-brand-200 bg-white hover:border-accent hover:text-accent transition-all">
            <ShoppingBag size={16} /> Voir le catalogue <ArrowRight size={14} />
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t border-brand-100">
          <p className="text-xs text-brand-400 font-semibold uppercase tracking-wide mb-4">Pages populaires</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Coques iPhone", href: "/catalogue?q=coque" },
              { label: "Pochettes", href: "/catalogue?q=pochette" },
              { label: "Chargeurs", href: "/catalogue?q=chargeur" },
              { label: "Contact", href: "/contact" },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className="text-xs font-medium text-brand-600 hover:text-accent border border-brand-100 hover:border-accent/30 rounded-full px-4 py-1.5 transition-all bg-white">
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
