"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Banner, BannerPosition } from "@/lib/types";

const POSITION_LABEL: Record<BannerPosition, string> = {
  home_hero: "Accueil - sous le hero",
  home_mid: "Accueil - milieu (promo)",
  catalogue_top: "Catalogue - haut de page",
  header_strip: "Bandeau tout en haut"
};

const POSITION_HELP: Record<BannerPosition, string> = {
  home_hero: "S'affiche juste sous la bannière principale de l'accueil.",
  home_mid: "S'affiche au milieu de l'accueil, entre les catégories et les produits vedettes.",
  catalogue_top: "S'affiche en haut de la page /catalogue, au-dessus des filtres.",
  header_strip: "Non utilisé ici - gérer le bandeau dans Paramètres."
};

const POSITION_CHOICES: BannerPosition[] = ["home_hero", "home_mid", "catalogue_top"];

type Draft = {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  cta_label: string;
  position: BannerPosition;
  sort_order: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
};

const EMPTY: Draft = {
  title: "",
  subtitle: "",
  image_url: "",
  link_url: "",
  cta_label: "",
  position: "home_mid",
  sort_order: 0,
  is_active: true,
  starts_at: "",
  ends_at: ""
};

function toDraft(b: Banner): Draft {
  return {
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || "",
    image_url: b.image_url || "",
    link_url: b.link_url || "",
    cta_label: b.cta_label || "",
    position: b.position,
    sort_order: b.sort_order,
    is_active: b.is_active,
    starts_at: b.starts_at ? b.starts_at.slice(0, 16) : "",
    ends_at: b.ends_at ? b.ends_at.slice(0, 16) : ""
  };
}

export function BannerManager({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function edit(b: Banner) {
    setDraft(toDraft(b));
  }

  function create() {
    setDraft({ ...EMPTY });
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
        title: draft.title,
        subtitle: draft.subtitle || null,
        image_url: draft.image_url || null,
        link_url: draft.link_url || null,
        cta_label: draft.cta_label || null,
        position: draft.position,
        sort_order: draft.sort_order,
        is_active: draft.is_active,
        starts_at: draft.starts_at || null,
        ends_at: draft.ends_at || null
      };

      const isEdit = Boolean(draft.id);
      const url = isEdit ? "/api/admin/banners/" + draft.id : "/api/admin/banners";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      if (isEdit) {
        setBanners((prev) => prev.map((x) => (x.id === draft.id ? data : x)));
      } else {
        setBanners((prev) => [data, ...prev]);
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
    if (!confirm("Supprimer cette bannière ?")) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/banners/" + id, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      setBanners((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="btn-primary" onClick={create} type="button">
          <Plus className="h-4 w-4" />
          Nouvelle bannière
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {draft && (
        <div className="card space-y-5 p-4 md:p-6">
          <h2 className="font-semibold text-brand-950">{draft.id ? "Modifier la bannière" : "Nouvelle bannière"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Titre">
              <input className="input" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>

            <Field label="Position">
              <select
                className="input"
                value={draft.position}
                onChange={(e) => setDraft({ ...draft, position: e.target.value as BannerPosition })}
              >
                {POSITION_CHOICES.map((k) => (
                  <option key={k} value={k}>
                    {POSITION_LABEL[k]}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-brand-500">{POSITION_HELP[draft.position]}</p>
            </Field>

            <Field label="Sous-titre" full>
              <input className="input" value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
            </Field>

            <Field label="Image" full>
              <ImageUploader value={draft.image_url} onChange={(url) => setDraft({ ...draft, image_url: url })} folder="banners" />
            </Field>

            <Field label="Lien de destination">
              <input
                className="input"
                value={draft.link_url}
                onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
                placeholder="/catalogue?marque=Apple"
              />
            </Field>

            <Field label="Texte du bouton">
              <input
                className="input"
                value={draft.cta_label}
                onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })}
                placeholder="Ex: Voir l'offre"
              />
            </Field>

            <Field label="Ordre d'affichage">
              <input
                type="number"
                className="input"
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })}
              />
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

          <div className="flex flex-wrap gap-3 border-t border-brand-100 pt-4">
            <button className="btn-primary" onClick={save} disabled={busy} type="button">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
            </button>
            <button className="btn-outline" onClick={cancel} type="button">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/60 text-left text-brand-500">
              <th className="w-24 px-4 py-3 text-xs font-semibold uppercase tracking-wide">Aperçu</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Titre</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Position</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Ordre</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="relative grid h-12 w-20 place-items-center overflow-hidden rounded border border-brand-100 bg-white">
                    {b.image_url ? (
                      <Image src={b.image_url} alt="" fill className="object-cover" sizes="80px" />
                    ) : (
                      <ImageOff className="h-4 w-4 text-brand-300" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-900 font-medium">{b.title}</td>
                <td className="px-4 py-3 text-brand-600">{POSITION_LABEL[b.position]}</td>
                <td className="px-4 py-3 text-brand-600">{b.sort_order}</td>
                <td className="px-4 py-3">
                  <span className={"badge " + (b.is_active ? "bg-green-100 text-green-800" : "bg-brand-100 text-brand-700")}>
                    {b.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-3">
                    <button type="button" onClick={() => edit(b)} className="text-brand-700 hover:text-accent">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => remove(b.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {banners.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-500">
                  Aucune bannière
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {banners.map((b) => (
          <div key={b.id} className="card p-3">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-brand-100 bg-white">
                {b.image_url ? (
                  <Image src={b.image_url} alt="" fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageOff className="h-4 w-4 text-brand-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brand-900 text-sm truncate">{b.title}</p>
                <p className="text-xs text-brand-500 truncate">{POSITION_LABEL[b.position]}</p>
                <span className={"badge text-[10px] mt-1 " + (b.is_active ? "bg-green-100 text-green-800" : "bg-brand-100 text-brand-700")}>
                  {b.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={() => edit(b)} className="p-1.5 text-brand-500 hover:text-accent">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => remove(b.id)} className="p-1.5 text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="card px-4 py-8 text-center text-brand-500">
            Aucune bannière
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={"block " + (full ? "md:col-span-2" : "")}>
      <span className="mb-1 block text-sm font-medium text-brand-800">{label}</span>
      {children}
    </label>
  );
}
