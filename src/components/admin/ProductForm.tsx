"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Plus, Trash2, Upload, X, Images, Link as LinkIcon, GripVertical } from "lucide-react";
import { slugify } from "@/lib/utils";
import type { Product, ProductFaq, ProductSpec } from "@/lib/types";
import { MediaPicker } from "@/components/admin/MediaPicker";

type Category = { id: string; name: string };

type Props = {
  product?: Product;
  categories: Category[];
  brands?: string[];
};

export function ProductForm({ product, categories, brands = [] }: Props) {
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
  const [highlights, setHighlights] = useState<string[]>(product?.highlights ?? []);
  const [uploading, setUploading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
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
        faq,
        highlights: highlights.filter(h => h.trim())
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
            {brands.length > 0 ? (
              <select
                className="input"
                value={brands.includes(form.brand) ? form.brand : form.brand ? "__autre__" : ""}
                onChange={(e) => {
                  if (e.target.value === "__autre__") return; // champ libre géré en dessous
                  setForm({ ...form, brand: e.target.value });
                }}
              >
                <option value="">— Choisir une marque —</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                <option value="__autre__">Autre (saisir manuellement)</option>
              </select>
            ) : null}
            {(brands.length === 0 || !brands.includes(form.brand)) && (
              <input
                className={`input ${brands.length > 0 ? "mt-2" : ""}`}
                placeholder={brands.length > 0 ? "Nom de la marque (autre)" : "Nom de la marque"}
                value={brands.includes(form.brand) ? "" : form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            )}
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
          <div>
            <h2 className="font-semibold text-brand-950">Points forts</h2>
            <p className="text-xs text-brand-500 mt-0.5">Affiché sur la page produit sous forme de liste à cocher.</p>
          </div>
          <button type="button" onClick={() => setHighlights([...highlights, ""])} className="btn-outline text-xs">
            <Plus className="h-3.5 w-3.5" /> Ajouter
          </button>
        </div>

        {highlights.length === 0 ? (
          <p className="text-xs text-brand-500">Aucun point fort. Cliquez sur Ajouter pour en créer.</p>
        ) : (
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  placeholder="Ex : Compatible iPhone 15 / 15 Pro"
                  value={h}
                  onChange={(e) => setHighlights(highlights.map((x, j) => j === i ? e.target.value : x))}
                />
                <button type="button" onClick={() => setHighlights(highlights.filter((_, j) => j !== i))} className="btn-ghost text-red-700" aria-label="Supprimer">
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-brand-950">Images ({images.length})</h2>
          <div className="flex items-center gap-2">
            {/* Bibliothèque */}
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="btn-outline h-8 px-3 text-xs flex items-center gap-1.5"
            >
              <Images className="h-3.5 w-3.5" /> Bibliothèque
            </button>
            {/* URL */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="btn-outline h-8 px-3 text-xs flex items-center gap-1.5"
            >
              <LinkIcon className="h-3.5 w-3.5" /> URL
            </button>
            {/* Upload direct */}
            <label className="btn-accent h-8 px-3 text-xs flex items-center gap-1.5 cursor-pointer">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Upload className="h-3.5 w-3.5" />Uploader</>}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>

        {/* URL input */}
        {showUrlInput && (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
              className="input flex-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (urlInput.trim() && !images.includes(urlInput.trim())) {
                    setImages((prev) => [...prev, urlInput.trim()]);
                    setUrlInput("");
                    setShowUrlInput(false);
                  }
                }
              }}
            />
            <button
              type="button"
              className="btn-primary px-4 text-sm"
              onClick={() => {
                if (urlInput.trim() && !images.includes(urlInput.trim())) {
                  setImages((prev) => [...prev, urlInput.trim()]);
                  setUrlInput("");
                  setShowUrlInput(false);
                }
              }}
            >
              Ajouter
            </button>
            <button type="button" onClick={() => { setShowUrlInput(false); setUrlInput(""); }} className="btn-outline px-3 text-sm">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Images grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((src, i) => (
              <div
                key={src + i}
                className="relative aspect-square rounded-lg overflow-hidden bg-brand-50"
                style={{ border: hoveredImg === i ? "2px solid #d97706" : "1px solid #e4e9f0" }}
                onMouseEnter={() => setHoveredImg(i)}
                onMouseLeave={() => setHoveredImg(null)}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="120px" />

                {i === 0 && (
                  <span style={{ position: "absolute", bottom: "4px", left: "4px", fontSize: "9px", fontWeight: 700, background: "#d97706", color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>
                    Principale
                  </span>
                )}

                {/* Overlay controls — visible on hover */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  opacity: hoveredImg === i ? 1 : 0,
                  transition: "opacity 0.15s ease",
                }}>
                  {i > 0 && (
                    <button type="button" onClick={() => { const a = [...images]; [a[i-1],a[i]]=[a[i],a[i-1]]; setImages(a); }}
                      style={{ width: "28px", height: "28px", borderRadius: "999px", background: "#fff", border: "none", cursor: "pointer", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: 700, color: "#1a1008" }}
                      title="Déplacer à gauche">←</button>
                  )}
                  <button type="button" onClick={() => removeImage(src)}
                    style={{ width: "28px", height: "28px", borderRadius: "999px", background: "#fff", border: "none", cursor: "pointer", display: "grid", placeItems: "center", color: "#dc2626" }}>
                    <X style={{ width: "14px", height: "14px" }} />
                  </button>
                  {i < images.length - 1 && (
                    <button type="button" onClick={() => { const a = [...images]; [a[i],a[i+1]]=[a[i+1],a[i]]; setImages(a); }}
                      style={{ width: "28px", height: "28px", borderRadius: "999px", background: "#fff", border: "none", cursor: "pointer", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: 700, color: "#1a1008" }}
                      title="Déplacer à droite">→</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-brand-200 p-8 text-center text-sm text-brand-500">
            Aucune image — utilisez les boutons ci-dessus pour en ajouter
          </div>
        )}

        <p className="text-xs text-brand-400">La première image est l'image principale. Utilisez ← → pour réordonner.</p>
      </div>

      {/* MediaPicker portal */}
      {showPicker && (
        <MediaPicker
          accept="image"
          folder="products"
          onSelect={(url) => {
            if (!images.includes(url)) setImages((prev) => [...prev, url]);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}

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

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        {isEdit ? (
          <button type="button" onClick={handleDelete} disabled={deleting} className="btn text-red-700 hover:bg-red-50 w-full sm:w-auto justify-center">
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        ) : <span className="hidden sm:block" />}

        <button type="submit" disabled={saving || uploading} className="btn-primary w-full sm:w-auto justify-center">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : uploading ? "Envoi de l'image…" : isEdit ? "Enregistrer" : "Créer le produit"}
        </button>
      </div>
    </form>
  );
}
