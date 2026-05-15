"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Brand } from "@/lib/types";

export function BrandManager({ initial }: { initial: Brand[] }) {
  const router = useRouter();
  const [brands, setBrands] = useState(initial);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, slug: slugify(trimmed) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      setBrands((prev) => [...prev, data]);
      setName("");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: string, changes: Partial<Brand>) {
    const res = await fetch("/api/admin/brands/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur");
    return data as Brand;
  }

  async function toggleActive(b: Brand) {
    try {
      const updated = await patch(b.id, { is_active: !b.is_active });
      setBrands((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  function updateSortLocally(id: string, sort: number) {
    setBrands((prev) => prev.map((x) => (x.id === id ? { ...x, sort_order: sort } : x)));
  }

  async function saveSort(id: string, sort: number) {
    try {
      const updated = await patch(id, { sort_order: sort });
      setBrands((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function uploadLogo(b: Brand, file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const up = await fetch("/api/admin/upload?folder=brands", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload échoué");

      const updated = await patch(b.id, { logo_url: upData.urls?.[0] || null });
      setBrands((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function clearLogo(b: Brand) {
    try {
      const updated = await patch(b.id, { logo_url: null });
      setBrands((prev) => prev.map((x) => (x.id === b.id ? updated : x)));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette marque ? Les produits gardent leur marque en texte.")) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/brands/" + id, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }

      setBrands((prev) => prev.filter((x) => x.id !== id));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="card p-4 md:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-brand-800">Nouvelle marque</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: OnePlus" />
          </div>
          <button type="submit" disabled={busy} className="btn-primary sm:shrink-0">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" />Ajouter</>}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/60 text-left text-brand-500">
              <th className="w-20 px-4 py-3 text-xs font-semibold uppercase tracking-wide">Logo</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Nom</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Slug</th>
              <th className="w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wide">Ordre</th>
              <th className="w-28 px-4 py-3 text-xs font-semibold uppercase tracking-wide">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/30 transition-colors">
                <td className="px-4 py-3">
                  <LogoCell brand={b} onUpload={(file) => uploadLogo(b, file)} onClear={() => clearLogo(b)} />
                </td>
                <td className="px-4 py-3 text-brand-900 font-medium">{b.name}</td>
                <td className="px-4 py-3 text-brand-600 font-mono text-xs">{b.slug}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    className="input max-w-[80px] py-1"
                    value={b.sort_order}
                    onChange={(e) => updateSortLocally(b.id, Number(e.target.value) || 0)}
                    onBlur={(e) => saveSort(b.id, Number(e.target.value) || 0)}
                  />
                </td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={b.is_active} onChange={() => toggleActive(b)} className="h-4 w-4" />
                    <span className="text-xs text-brand-600">{b.is_active ? "Oui" : "Non"}</span>
                  </label>
                </td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => remove(b.id)} className="text-red-600 hover:text-red-700 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {brands.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-500">
                  Aucune marque
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {brands.map((b) => (
          <div key={b.id} className="card p-3">
            <div className="flex items-center gap-3">
              <LogoCell brand={b} onUpload={(file) => uploadLogo(b, file)} onClear={() => clearLogo(b)} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brand-900 text-sm">{b.name}</p>
                <p className="text-[10px] text-brand-400 font-mono">{b.slug}</p>
              </div>
              <button type="button" onClick={() => remove(b.id)} className="text-red-500 hover:text-red-700 p-1.5 shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-50">
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-500">Ordre :</span>
                <input
                  type="number"
                  className="input py-1 text-center w-14"
                  value={b.sort_order}
                  onChange={(e) => updateSortLocally(b.id, Number(e.target.value) || 0)}
                  onBlur={(e) => saveSort(b.id, Number(e.target.value) || 0)}
                />
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={b.is_active} onChange={() => toggleActive(b)} className="h-4 w-4" />
                <span className="text-xs text-brand-600">{b.is_active ? "Active" : "Inactive"}</span>
              </label>
            </div>
          </div>
        ))}

        {brands.length === 0 && (
          <div className="card px-4 py-8 text-center text-brand-500">
            Aucune marque
          </div>
        )}
      </div>
    </div>
  );
}

function LogoCell({ brand, onUpload, onClear }: { brand: Brand; onUpload: (f: File) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative grid h-12 w-16 shrink-0 place-items-center rounded border border-brand-100 bg-white">
      {brand.logo_url ? (
        <>
          <Image src={brand.logo_url} alt={brand.name} fill className="object-contain p-1" sizes="64px" />
          <button
            type="button"
            onClick={onClear}
            className="absolute -right-1.5 -top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full border border-brand-100 bg-white text-red-700 shadow hover:bg-red-50"
            aria-label="Retirer le logo"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid h-full w-full place-items-center rounded text-brand-400 transition-colors hover:bg-brand-50 hover:text-brand-700"
          aria-label="Téléverser un logo"
        >
          <Upload className="h-4 w-4" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
