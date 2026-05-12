"use client";

import { useState } from "react";
import { Images, Link as LinkIcon, Loader2, Upload, X } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";

type Folder = "products" | "banners" | "brands" | "site" | "general";

type Props = {
  value: string;
  onChange: (url: string) => void;
  folder: Folder;
  label?: string;
  emptyMinHeight?: "sm" | "md" | "lg";
};

const emptyHeightClass: Record<NonNullable<Props["emptyMinHeight"]>, string> = {
  sm: "min-h-[120px]",
  md: "min-h-[180px]",
  lg: "min-h-[240px]"
};

export function ImageUploader({ value, onChange, folder, label, emptyMinHeight = "md" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState(value);
  const [showPicker, setShowPicker] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await fetch("/api/admin/upload?folder=" + folder, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'upload");
      const nextUrl = data.urls?.[0] || "";
      onChange(nextUrl);
      setUrlDraft(nextUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-brand-800">{label}</label>}

      {value ? (
        <div className="relative inline-block max-w-full overflow-hidden rounded-lg bg-white ring-1 ring-brand-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="block h-auto max-h-[420px] w-full object-contain" />
          <button
            type="button"
            onClick={() => { onChange(""); setUrlDraft(""); }}
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-red-700 shadow hover:bg-white"
            aria-label="Retirer l'image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={
            "relative rounded-lg border-2 border-dashed border-brand-200 transition hover:border-brand-300 " +
            emptyHeightClass[emptyMinHeight]
          }
        >
          <label className="absolute inset-0 grid cursor-pointer place-items-center hover:bg-brand-50 transition rounded-lg">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            ) : (
              <div className="flex flex-col items-center text-xs text-brand-500">
                <Upload className="mb-1 h-6 w-6" />
                <span className="font-medium">Téléverser une image</span>
                <span className="mt-0.5 text-[11px] text-brand-400">JPG, PNG, WebP - 5 Mo max</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-dark transition-colors"
        >
          <Images className="h-3.5 w-3.5" />
          Choisir depuis la bibliothèque
        </button>
        <span className="text-brand-200">|</span>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="inline-flex items-center gap-1 text-xs text-brand-500 hover:text-brand-900 transition-colors"
        >
          <LinkIcon className="h-3 w-3" />
          {showUrlInput ? "Masquer" : "URL externe"}
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="https://..."
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
          />
          <button
            type="button"
            className="btn-outline"
            onClick={() => { const next = urlDraft.trim(); onChange(next); setUrlDraft(next); }}
          >
            Utiliser
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-700">{error}</p>}

      {showPicker && (
        <MediaPicker
          accept="image"
          folder={folder}
          onSelect={(url) => { onChange(url); setUrlDraft(url); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
