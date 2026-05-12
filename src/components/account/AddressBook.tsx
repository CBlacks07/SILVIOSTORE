"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Address } from "@/lib/types";

type Draft = {
  id?: string;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  district: string;
  details: string;
  is_default: boolean;
};

const EMPTY: Draft = {
  full_name: "",
  phone: "",
  country: "",
  city: "",
  district: "",
  details: "",
  is_default: false
};

function toDraft(a: Address): Draft {
  return {
    id: a.id,
    full_name: a.full_name,
    phone: a.phone,
    country: a.country,
    city: a.city,
    district: a.district || "",
    details: a.details,
    is_default: a.is_default
  };
}

export function AddressBook({ initial }: { initial: Address[] }) {
  const [rows, setRows] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => Number(b.is_default) - Number(a.is_default)),
    [rows]
  );

  function create() {
    setError(null);
    setDraft({ ...EMPTY, is_default: rows.length === 0 });
  }

  function edit(a: Address) {
    setError(null);
    setDraft(toDraft(a));
  }

  function cancel() {
    setDraft(null);
    setError(null);
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError(null);

    try {
      const payload = {
        full_name: draft.full_name,
        phone: draft.phone,
        country: draft.country,
        city: draft.city,
        district: draft.district,
        details: draft.details,
        is_default: draft.is_default
      };

      const isEdit = Boolean(draft.id);
      const url = isEdit ? "/api/account/addresses/" + draft.id : "/api/account/addresses";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      const next = data.address as Address;
      if (isEdit) {
        setRows((prev) => prev.map((x) => (x.id === next.id ? next : { ...x, is_default: next.is_default ? false : x.is_default })));
      } else {
        setRows((prev) => [next, ...prev.map((x) => ({ ...x, is_default: next.is_default ? false : x.is_default }))]);
      }

      setDraft(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette adresse ?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/addresses/" + id, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      const without = rows.filter((a) => a.id !== id);
      if (without.length > 0 && !without.some((a) => a.is_default)) {
        without[0] = { ...without[0], is_default: true };
      }
      setRows(without);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-brand-950">Mes adresses de livraison</h2>
        <button type="button" className="btn-outline" onClick={create}>
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

      {sorted.length === 0 ? (
        <p className="text-sm text-brand-600">Aucune adresse enregistrée.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((a) => (
            <div key={a.id} className="rounded border border-brand-100 p-4 text-sm">
              <p className="font-medium text-brand-950">{a.full_name}</p>
              <p className="text-brand-700">{a.phone}</p>
              <p className="mt-2 text-brand-700">{a.details}</p>
              <p className="text-brand-700">{a.city}, {a.country}</p>
              {a.district && <p className="text-brand-600">Quartier: {a.district}</p>}
              <div className="mt-3 flex items-center justify-between">
                {a.is_default ? <span className="badge bg-brand-100 text-brand-800">Par défaut</span> : <span />}
                <div className="inline-flex gap-3">
                  <button type="button" onClick={() => edit(a)} className="text-brand-700 hover:text-accent">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => remove(a.id)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <div className="mt-6 space-y-4 border-t border-brand-100 pt-5">
          <h3 className="font-medium text-brand-950">{draft.id ? "Modifier l'adresse" : "Nouvelle adresse"}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet">
              <input className="input" value={draft.full_name} onChange={(e) => setDraft({ ...draft, full_name: e.target.value })} />
            </Field>
            <Field label="Numéro">
              <input className="input" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
            </Field>
            <Field label="Pays">
              <input className="input" value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
            </Field>
            <Field label="Ville">
              <input className="input" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
            </Field>
            <Field label="Quartier (optionnel)">
              <input className="input" value={draft.district} onChange={(e) => setDraft({ ...draft, district: e.target.value })} />
            </Field>
            <Field label="Détails" full>
              <textarea className="input" rows={3} value={draft.details} onChange={(e) => setDraft({ ...draft, details: e.target.value })} />
            </Field>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-brand-800">
            <input
              type="checkbox"
              checked={draft.is_default}
              onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })}
              className="h-4 w-4"
            />
            Définir comme adresse par défaut
          </label>

          <div className="flex gap-3">
            <button type="button" className="btn-primary" onClick={save} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </button>
            <button type="button" className="btn-outline" onClick={cancel}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={"block " + (full ? "sm:col-span-2" : "")}>
      <span className="mb-1 block text-sm font-medium text-brand-800">{label}</span>
      {children}
    </label>
  );
}
