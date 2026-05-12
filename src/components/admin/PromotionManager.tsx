"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { Promotion, PromotionType } from "@/lib/types";

type Draft = {
  id?: string;
  code: string;
  description: string;
  discount_type: PromotionType;
  discount_value: number;
  min_order: number;
  max_uses: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

const EMPTY: Draft = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: 10,
  min_order: 0,
  max_uses: "",
  starts_at: "",
  ends_at: "",
  is_active: true
};

function toDraft(p: Promotion): Draft {
  return {
    id: p.id,
    code: p.code,
    description: p.description || "",
    discount_type: p.discount_type,
    discount_value: p.discount_value,
    min_order: p.min_order,
    max_uses: p.max_uses != null ? String(p.max_uses) : "",
    starts_at: p.starts_at ? p.starts_at.slice(0, 16) : "",
    ends_at: p.ends_at ? p.ends_at.slice(0, 16) : "",
    is_active: p.is_active
  };
}

export function PromotionManager({ initial }: { initial: Promotion[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function create() {
    setDraft({ ...EMPTY });
  }

  function edit(p: Promotion) {
    setDraft(toDraft(p));
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
        code: draft.code.trim().toUpperCase(),
        description: draft.description || null,
        discount_type: draft.discount_type,
        discount_value: draft.discount_value,
        min_order: draft.min_order,
        max_uses: draft.max_uses ? Number(draft.max_uses) : null,
        starts_at: draft.starts_at || null,
        ends_at: draft.ends_at || null,
        is_active: draft.is_active
      };

      const isEdit = Boolean(draft.id);
      const url = isEdit ? "/api/admin/promotions/" + draft.id : "/api/admin/promotions";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      if (isEdit) {
        setRows((prev) => prev.map((x) => (x.id === draft.id ? data : x)));
      } else {
        setRows((prev) => [data, ...prev]);
      }

      setDraft(null);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer ce code promo ?")) return;
    setError(null);

    try {
      const res = await fetch("/api/admin/promotions/" + id, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      setRows((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="btn-primary" onClick={create} type="button">
          <Plus className="h-4 w-4" />
          Nouveau code promo
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {draft && (
        <div className="card space-y-5 p-6">
          <h2 className="font-semibold text-brand-950">{draft.id ? "Modifier le code" : "Nouveau code promo"}</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Code (majuscules)">
              <input
                className="input uppercase"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="Ex: NOEL2026"
              />
            </Field>

            <Field label="Type de remise">
              <select
                className="input"
                value={draft.discount_type}
                onChange={(e) => setDraft({ ...draft, discount_type: e.target.value as PromotionType })}
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="amount">Montant fixe (XOF)</option>
              </select>
            </Field>

            <Field label={draft.discount_type === "percent" ? "Valeur (% entre 1 et 100)" : "Montant (XOF)"}>
              <input
                type="number"
                className="input"
                value={draft.discount_value}
                onChange={(e) => setDraft({ ...draft, discount_value: Number(e.target.value) || 0 })}
              />
            </Field>

            <Field label="Minimum de commande (XOF)">
              <input
                type="number"
                className="input"
                value={draft.min_order}
                onChange={(e) => setDraft({ ...draft, min_order: Number(e.target.value) || 0 })}
              />
            </Field>

            <Field label="Usages maximum (vide = illimité)">
              <input
                type="number"
                className="input"
                value={draft.max_uses}
                onChange={(e) => setDraft({ ...draft, max_uses: e.target.value })}
              />
            </Field>

            <Field label="Description (interne)">
              <input className="input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>

            <Field label="Début (optionnel)">
              <input
                type="datetime-local"
                className="input"
                value={draft.starts_at}
                onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
              />
            </Field>

            <Field label="Fin (optionnel)">
              <input
                type="datetime-local"
                className="input"
                value={draft.ends_at}
                onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })}
              />
            </Field>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-brand-800">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
              className="h-4 w-4"
            />
            Active
          </label>

          <div className="flex gap-3 border-t border-brand-100 pt-4">
            <button className="btn-primary" onClick={save} disabled={busy} type="button">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </button>
            <button className="btn-outline" onClick={cancel} type="button">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/60 text-left text-brand-500">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Remise</th>
              <th className="px-4 py-3">Min. commande</th>
              <th className="px-4 py-3">Usages</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-brand-100 last:border-0">
                <td className="px-4 py-3 font-medium text-brand-900">{p.code}</td>
                <td className="px-4 py-3 text-brand-700">
                  {p.discount_type === "percent" ? `${p.discount_value}%` : `${p.discount_value.toLocaleString("fr-FR")} XOF`}
                </td>
                <td className="px-4 py-3 text-brand-700">{p.min_order.toLocaleString("fr-FR")} XOF</td>
                <td className="px-4 py-3 text-brand-700">
                  {p.used_count}
                  {p.max_uses != null ? ` / ${p.max_uses}` : ""}
                </td>
                <td className="px-4 py-3">
                  <span className={"badge " + (p.is_active ? "bg-green-100 text-green-800" : "bg-brand-100 text-brand-700")}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-3">
                    <button type="button" onClick={() => edit(p)} className="text-brand-700 hover:text-accent">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(p.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-500">
                  Aucun code promo
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brand-800">{label}</span>
      {children}
    </label>
  );
}
