"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, Trash2, X, Upload } from "lucide-react";
import { slugify } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Category } from "@/lib/types";

export function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          slug: slugify(trimmed),
          description: newDesc,
          image_url: newImage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      setCategories((prev) => [...prev, data]);
      setNewName("");
      setNewDesc("");
      setNewImage("");
      setShowAdd(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, changes: Partial<Category>) {
    const res = await fetch("/api/admin/categories/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur");
    return data;
  }

  async function updateSort(id: string, val: number) {
    try {
      const updated = await patch(id, { sort_order: val });
      setCategories((prev) => prev.map(c => c.id === id ? updated : c));
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function updateImage(id: string, url: string) {
    try {
      const updated = await patch(id, { image_url: url });
      setCategories((prev) => prev.map(c => c.id === id ? updated : c));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette catégorie ? Les produits ne seront pas supprimés.")) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories/" + id, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-brand-900 uppercase tracking-wider">Liste des catégories</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary py-2 text-xs shrink-0"
        >
          {showAdd ? <><X className="h-4 w-4" /> Annuler</> : <><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Ajouter une catégorie</span><span className="sm:hidden">Ajouter</span></>}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={add} className="card p-4 md:p-6 border-2 border-accent/20 bg-accent/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Nom de la catégorie</label>
                <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Coques Premium" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Description (optionnelle)</label>
                <textarea className="input min-h-[100px]" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Courte description pour le SEO et le catalogue..." />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-800">Image de couverture</label>
              <ImageUploader value={newImage} onChange={setNewImage} folder="site" emptyMinHeight="sm" onUploadingChange={setUploadingImage} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={busy || uploadingImage} className="btn-accent px-8">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : uploadingImage ? "Envoi de l'image…" : "Créer la catégorie"}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/60 text-left text-brand-500">
              <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Ordre</th>
              <th className="w-24 px-4 py-3 text-xs font-semibold uppercase tracking-wide">Image</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Catégorie</th>
              <th className="px-4 py-3 hidden md:table-cell text-xs font-semibold uppercase tracking-wide">Description</th>
              <th className="w-20 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/30 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="input py-1 text-center w-12 mx-auto"
                    defaultValue={c.sort_order || 0}
                    onBlur={(e) => updateSort(c.id, parseInt(e.target.value) || 0)}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative h-12 w-12 rounded-lg bg-white border border-brand-100 overflow-hidden group">
                    {c.image_url ? (
                      <Image src={c.image_url} alt="" fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-brand-300">
                        <Upload className="h-4 w-4" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Plus className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const fd = new FormData();
                          fd.append("files", f);
                          const res = await fetch("/api/admin/upload?folder=site", { method: "POST", body: fd });
                          const data = await res.json();
                          if (data.urls?.[0]) updateImage(c.id, data.urls[0]);
                        }}
                      />
                    </label>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-brand-950">{c.name}</div>
                  <div className="text-[10px] text-brand-400 font-mono uppercase">{c.slug}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-xs text-brand-600 line-clamp-2 max-w-xs">{c.description || "Pas de description"}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => remove(c.id)} className="p-2 text-brand-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-brand-500 italic">
                  Aucune catégorie définie pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="card p-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 rounded-lg bg-white border border-brand-100 overflow-hidden group">
                {c.image_url ? (
                  <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-brand-300">
                    <Upload className="h-4 w-4" />
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Plus className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const fd = new FormData();
                      fd.append("files", f);
                      const res = await fetch("/api/admin/upload?folder=site", { method: "POST", body: fd });
                      const data = await res.json();
                      if (data.urls?.[0]) updateImage(c.id, data.urls[0]);
                    }}
                  />
                </label>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-950 text-sm">{c.name}</p>
                <p className="text-[10px] text-brand-400 font-mono uppercase">{c.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-brand-400">Ordre</span>
                  <input
                    type="number"
                    className="input py-1 text-center w-12"
                    defaultValue={c.sort_order || 0}
                    onBlur={(e) => updateSort(c.id, parseInt(e.target.value) || 0)}
                  />
                </div>
                <button type="button" onClick={() => remove(c.id)} className="p-1.5 text-brand-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {c.description && (
              <p className="mt-2 text-xs text-brand-500 pl-15 leading-relaxed line-clamp-2">{c.description}</p>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="card px-4 py-12 text-center text-brand-500 italic">
            Aucune catégorie définie pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
