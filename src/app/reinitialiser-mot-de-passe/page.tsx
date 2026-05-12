export const dynamic = "force-dynamic";
﻿"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Lien invalide ou incomplet.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      router.push("/connexion");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="container-page max-w-md py-16">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-bold text-brand-950">Réinitialiser le mot de passe</h1>
        <p className="mt-1 text-sm text-brand-600">Choisissez un nouveau mot de passe sécurisé.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">Nouveau mot de passe</label>
            <input
              type="password"
              required
              minLength={8}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">Confirmer le mot de passe</label>
            <input
              type="password"
              required
              minLength={8}
              className="input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <div className="flex justify-center pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer le nouveau mot de passe"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-brand-600">
          <Link href="/connexion" className="font-medium text-accent hover:text-accent-dark">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
