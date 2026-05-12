export const dynamic = "force-dynamic";
﻿"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
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
    <div className="container-page max-w-md py-16">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-bold text-brand-950">Connexion</h1>
        <p className="mt-1 text-sm text-brand-600">Accédez à votre compte SILVIO STORE.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">E-mail</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">Mot de passe</label>
            <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div className="flex justify-end">
            <Link href="/mot-de-passe-oublie" className="text-sm text-accent hover:text-accent-dark">
              Mot de passe oublié ?
            </Link>
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-center pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-brand-600">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-accent hover:text-accent-dark">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
