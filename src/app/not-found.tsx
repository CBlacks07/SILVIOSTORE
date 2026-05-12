import Link from "next/link";

export const metadata = { title: "Page introuvable — SILVIO STORE" };

export default function NotFound() {
  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6"
      style={{ background: "rgb(245,247,250)" }}
    >
      <p
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "clamp(80px, 15vw, 140px)",
          fontWeight: 700,
          color: "#e4e9f0",
          lineHeight: 1,
          letterSpacing: "-0.04em",
          margin: 0,
          userSelect: "none",
        }}
      >
        404
      </p>

      <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mt-2 mb-4">
        Page introuvable
      </p>

      <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-950 tracking-tight mb-3">
        Cette page n&apos;existe pas
      </h1>

      <p
        className="text-brand-500 max-w-md mb-8"
        style={{ fontFamily: "var(--font-roboto), Roboto, sans-serif", fontSize: "15px", lineHeight: 1.65 }}
      >
        Le lien que vous avez suivi est peut-être expiré ou la page a été déplacée.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-hero-secondary">
          Retour à l&apos;accueil
        </Link>
        <Link href="/catalogue" className="btn-hero-outline">
          Voir le catalogue
        </Link>
      </div>
    </div>
  );
}
