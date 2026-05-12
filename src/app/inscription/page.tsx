"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const AUTH_EVENT_KEY = "silvio-auth:event";

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify({ type: "signup", at: Date.now() }));
      window.location.assign("/compte");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16 max-w-md">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-bold text-brand-950">Créer un compte</h1>
        <p className="mt-1 text-sm text-brand-600">Suivez vos commandes et accélérez vos paiements.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">Nom complet</label>
            <input required className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">Numéro</label>
            <input required type="tel" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">E-mail</label>
            <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">Mot de passe</label>
            <input required type="password" minLength={8} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-center pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer mon compte"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-brand-600">
          Déjà inscrit  <Link href="/connexion" className="font-medium text-accent hover:text-accent-dark">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
