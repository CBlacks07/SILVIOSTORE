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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 100%)" }}>

      <div className="w-full max-w-[420px]">
        {/* Logo + titre */}
        <div className="text-center mb-8">
          <div className="relative h-16 w-16 mx-auto mb-5 rounded-full overflow-hidden ring-4 ring-accent/30">
            <Image src="/logo-04.png" alt="SILVIO STORE" fill className="object-cover" sizes="64px" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Connexion</h1>
          <p className="text-sm text-white/50">Accédez à votre compte SILVIO STORE</p>
        </div>

        {/* Card formulaire */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
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

        {/* Trust signals sous la card */}
        <div className="flex justify-center gap-6 mt-6">
          {[
            { icon: Star,        text: "4.9/5" },
            { icon: ShieldCheck, text: "Garanti" },
            { icon: Truck,       text: "Livraison rapide" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs text-white/40">
              <Icon className="h-3.5 w-3.5" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
