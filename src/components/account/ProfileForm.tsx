"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, KeyRound, ChevronRight } from "lucide-react";

type UserProfile = {
  full_name: string | null;
  phone: string | null;
  email: string;
  role: "customer" | "admin";
};

export function ProfileForm({ initial }: { initial: UserProfile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: initial.full_name || "",
    phone: initial.phone || "",
    email: initial.email
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      setSuccess("Profil mis à jour.");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  }

  return (
    <div className="space-y-5">
      {/* Profil */}
      <div className="card p-6">
        <h2 className="font-semibold text-brand-950 mb-4">Informations personnelles</h2>

        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">Nom complet</label>
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">Numéro</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-800">E-mail</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>

          <div className="text-sm text-brand-600">
            Type de compte : <span className="font-medium text-brand-900 capitalize">{initial.role}</span>
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer les modifications"}
          </button>
        </form>
      </div>

      {/* Sécurité */}
      <div className="card p-6">
        <h2 className="font-semibold text-brand-950 mb-1">Sécurité</h2>
        <p className="text-sm text-brand-500 mb-4">Gérez votre mot de passe et la sécurité de votre compte.</p>

        <Link
          href={`/mot-de-passe-oublie?email=${encodeURIComponent(initial.email)}`}
          className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 hover:border-accent/40 hover:bg-brand-50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg grid place-items-center shrink-0"
              style={{ background: "rgba(217,119,6,0.10)" }}>
              <KeyRound className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-950">Changer le mot de passe</p>
              <p className="text-xs text-brand-500">Recevez un lien de réinitialisation par e-mail</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-brand-400 group-hover:text-accent transition-colors" />
        </Link>
      </div>
    </div>
  );
}
