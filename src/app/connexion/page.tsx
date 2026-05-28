"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, Truck, Star } from "lucide-react";
import { sanitizeRedirect } from "@/lib/safeRedirect";

const AUTH_EVENT_KEY = "silvio-auth:event";

export default function LoginPage() {
  const params = useSearchParams();
  const redirect = useMemo(() => sanitizeRedirect(params.get("redirect"), "/compte"), [params]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify({ type: "login", at: Date.now() }));
      window.location.assign(redirect);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] grid lg:grid-cols-2">

      {/* Côté gauche — formulaire */}
      <div className="flex items-center justify-center px-6 py-12 bg-[rgb(250,248,245)]">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <div className="relative h-16 w-16 mx-auto mb-4 rounded-full overflow-hidden">
              <Image src="/logo-04.png" alt="SILVIO STORE" fill className="object-cover" sizes="64px" />
            </div>
            <h1 className="font-display text-2xl font-bold text-brand-950 mb-1">Connexion</h1>
            <p className="text-sm text-brand-500">Accédez à votre compte SILVIO STORE</p>
          </div>

          <div className="bg-white rounded-2xl border border-brand-100 p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wide mb-1.5">E-mail</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com" className="input" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-brand-700 uppercase tracking-wide">Mot de passe</label>
                  <Link href="/mot-de-passe-oublie" className="text-xs text-accent font-semibold hover:underline">Oublié ?</Link>
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="input" />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-700">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: loading ? "#9ca3af" : "linear-gradient(135deg, #1a1008, #2c1c06)" }}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Connexion...</> : "Se connecter"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-brand-100" />
              <span className="text-xs text-brand-400 font-medium">Nouveau client ?</span>
              <div className="flex-1 h-px bg-brand-100" />
            </div>

            <Link href="/inscription"
              className="flex items-center justify-center w-full rounded-full py-3 text-sm font-bold text-accent border-2 border-accent/30 hover:border-accent hover:bg-accent/5 transition-all">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>

      {/* Côté droit — visuel de marque (masqué mobile) */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 60%, #1a1008 100%)" }}>

        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 40%, rgba(217,119,6,0.15) 0%, transparent 65%)" }} />

        <div className="relative z-10 text-center px-12 max-w-md">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-6">SILVIO STORE</p>
          <h2 className="font-display text-4xl font-black leading-tight mb-4">
            Accessoires premium<br />
            <span style={{ color: "#d97706" }}>livrés chez vous</span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-10">
            Coques, pochettes, bracelets Apple Watch et chargeurs rapides. Paiement Mobile Money, livraison dans toute la sous région.
          </p>

          {/* Trust signals */}
          <div className="space-y-3">
            {[
              { icon: Star,        text: "4.9/5 — Clients satisfaits" },
              { icon: ShieldCheck, text: "Produits garantis authentiques" },
              { icon: Truck,       text: "Livraison rapide sous-région" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/70">
                <div className="h-8 w-8 rounded-lg bg-accent/15 grid place-items-center shrink-0">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
