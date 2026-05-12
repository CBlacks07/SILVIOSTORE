"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Product, ProductFaq, ProductSpec } from "@/lib/types";

type Category = { id: string; name: string };

type Props = {
  product?: Product;
  categories: Category[];
};

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    brand: product?.brand || "",
    category_id: product?.category_id || categories[0]?.id || "",
    description: product?.description || "",
    long_description: product?.long_description || "",
    price: product?.price ?? 0,
    compare_at_price: product?.compare_at_price ?? "",
    stock: product?.stock ?? 0,
    sku: product?.sku || "",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false
  });

  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [specs, setSpecs] = useState<ProductSpec[]>(product?.specifications ?? []);
  const [faq, setFaq] = useState<ProductFaq[]>(product?.faq ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      for (const file of Array.from(files)) fd.append("files", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'upload");

      setImages((prev) => [...prev, ...data.urls]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.name),
        price: Number(form.price),
        compare_at_price: form.compare_at_price === "" ? null : Number(form.compare_at_price),
        stock: Number(form.stock),
        images,
        specifications: specs,
        faq
      };

      const url = isEdit ? "/api/admin/products/" + product!.id : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'enregistrement");

      router.push("/admin/produits");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm("Supprimer définitivement ce produit ?")) return;

    setDeleting(true);
    try {
      const res = await fetch("/api/admin/products/" + product.id, { method: "DELETE" });
      if (!res.ok) throw new Error("Suppression échouée");
      router.push("/admin/produits");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1">Nom du produit</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">Slug (URL)</label>
            <input className="input" placeholder="auto-généré" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">Marque</label>
            <input className="input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1">Catégorie</label>
          <select required className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1">Résumé court</label>
          <textarea rows={3} className="input" placeholder="1-2 phrases affichées à côté du prix" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1">Description complète</label>
          <textarea rows={8} className="input" placeholder="Présentation détaillée du produit" value={form.long_description || ""} onChange={(e) => setForm({ ...form, long_description: e.target.value })} />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-950">Caractéristiques techniques</h2>
          <button type="button" onClick={() => setSpecs([...specs, { label: "", value: "" }])} className="btn-outline text-xs">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>

        {specs.length === 0 ? (
          <p className="text-xs text-brand-500">Aucune caractéristique.</p>
        ) : (
          <div className="space-y-2">
            {specs.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr,1.5fr,auto] gap-2">
                <input className="input" placeholder="Libellé" value={s.label} onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                <input className="input" placeholder="Valeur" value={s.value} onChange={(e) => setSpecs(specs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="btn-ghost text-red-700" aria-label="Supprimer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-brand-950">FAQ</h2>
          <button type="button" onClick={() => setFaq([...faq, { question: "", answer: "" }])} className="btn-outline text-xs">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>

        {faq.length === 0 ? (
          <p className="text-xs text-brand-500">Aucune question.</p>
        ) : (
          <div className="space-y-3">
            {faq.map((f, i) => (
              <div key={i} className="grid gap-2 border border-brand-100 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <input className="input flex-1" placeholder="Question" value={f.question} onChange={(e) => setFaq(faq.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} />
                  <button type="button" onClick={() => setFaq(faq.filter((_, j) => j !== i))} className="btn-ghost text-red-700" aria-label="Supprimer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <textarea rows={3} className="input" placeholder="Réponse" value={f.answer} onChange={(e) => setFaq(faq.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-brand-950">Prix et stock</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">Prix (XOF)</label>
            <input required type="number" min={0} className="input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">Prix barré (optionnel)</label>
            <input type="number" min={0} className="input" value={form.compare_at_price as any} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value as any })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-800 mb-1">Stock</label>
            <input required type="number" min={0} className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-800 mb-1">SKU</label>
          <input className="input" value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-brand-950">Images</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((src) => (
            <div key={src} className="relative aspect-square rounded overflow-hidden border border-brand-100">
              <Image src={src} alt="" fill className="object-cover" sizes="120px" />
              <button type="button" onClick={() => removeImage(src)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-red-700 hover:bg-white" aria-label="Retirer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <label className="aspect-square rounded border-2 border-dashed border-brand-200 grid place-items-center cursor-pointer hover:border-brand-400 hover:bg-brand-50">
            {uploading ? <Loader2 className="h-5 w-5 animate-spin text-brand-500" /> : (
              <div className="flex flex-col items-center text-brand-500 text-xs">
                <Upload className="h-5 w-5 mb-1" />
                Ajouter
              </div>
            )}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>

      <div className="card p-6 space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          <span className="text-brand-900">Visible dans la boutique</span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
          <span className="text-brand-900">Mettre en vedette sur l'accueil</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex items-center justify-between">
        {isEdit ? (
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        ) : <span />}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Enregistrer" : "Créer le produit"}
        </button>
      </div>
    </form>
  );
}
