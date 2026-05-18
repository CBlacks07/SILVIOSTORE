"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugUrl, setDebugUrl] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDebugUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSuccess(data.message || "Si cet e-mail existe, un lien a été envoyé.");
      if (data.debugResetUrl) setDebugUrl(data.debugResetUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page max-w-md py-16">
      <div className="card p-8">
        <h1 className="font-display text-2xl font-bold text-brand-950">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-brand-600">Entrez votre e-mail pour recevoir un lien de réinitialisation.</p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">E-mail</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}
          {debugUrl && (
            <p className="rounded-md bg-brand-50 p-2 text-xs text-brand-700 break-all">
              Lien de test: <a href={debugUrl} className="text-accent hover:text-accent-dark">{debugUrl}</a>
            </p>
          )}

          <div className="flex justify-center pt-1">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Générer le lien"}
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
