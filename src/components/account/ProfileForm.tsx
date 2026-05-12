"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
    <div className="card p-6">
      <h2 className="font-semibold text-brand-950">Informations personnelles</h2>

      <form className="mt-4 space-y-4" onSubmit={submit}>
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

        <div className="text-sm text-brand-600">Type de compte: <span className="font-medium text-brand-900 capitalize">{initial.role}</span></div>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}

        <div className="flex justify-center pt-1">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
