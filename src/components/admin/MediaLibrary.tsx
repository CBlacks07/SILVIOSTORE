"use client";

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { AlertTriangle, Copy, Film, Grid3x3, Image, Loader2, Plus, Search, Trash2, Upload, X } from "lucide-react";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  type: "image" | "video";
  mime_type: string | null;
  size_bytes: number | null;
  folder: string;
  created_at: string;
};

type Stats = { total: number; images: number; videos: number; folders: string[] };

const FOLDERS = ["products", "site", "brands", "banners", "general"];

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

export function MediaLibrary({ stats: initialStats }: { stats: Stats }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState("general");
  const [deleting, setDeleting] = useState<string | null>(null);
  // Fichiers dont l'URL Blob ne répond plus (ex: supprimés directement dans
  // le dashboard Vercel plutôt que via cette médiathèque) — on les signale
  // au lieu d'afficher une vignette vide.
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (folderFilter) params.set("folder", folderFilter);
    if (q) params.set("q", q);
    const res = await fetch("/api/admin/media?" + params.toString());
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [typeFilter, folderFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const isVideo = Array.from(files).some((f) => f.type.startsWith("video/"));
      const res = await fetch(
        `/api/admin/upload?folder=${uploadFolder}${isVideo ? "&type=video" : ""}`,
        { method: "POST", body: fd }
      );
      if (res.ok) await load();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Supprimer ce fichier ?")) return;
    setDeleting(id);
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleting(null);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const folders = [...new Set([...FOLDERS, ...(initialStats.folders || [])])].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total fichiers", value: initialStats.total, icon: Grid3x3 },
          { label: "Images",         value: initialStats.images, icon: Image },
          { label: "Vidéos",         value: initialStats.videos, icon: Film },
        ].map((s) => (
          <div key={s.label} className="card px-3 py-3 md:px-4 flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-brand-50 grid place-items-center text-brand-500 shrink-0">
              <s.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-brand-500 truncate">{s.label}</p>
              <p className="font-bold text-brand-950 text-base md:text-lg tabular-nums">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card p-3 md:p-4 space-y-3">
        {/* Search + filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[150px] rounded-lg border border-brand-200 bg-brand-50 px-3 h-9">
            <Search className="h-4 w-4 text-brand-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher par nom..."
              className="flex-1 bg-transparent text-sm border-0 focus:outline-none placeholder-brand-400 min-w-0"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input h-9 py-0 text-sm"
          >
            <option value="">Tous les types</option>
            <option value="image">Images</option>
            <option value="video">Vidéos</option>
          </select>
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="input h-9 py-0 text-sm"
          >
            <option value="">Tous les dossiers</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        {/* Upload row */}
        <div className="flex items-center gap-2">
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            className="input h-9 py-0 text-sm flex-1 min-w-0"
          >
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="btn-accent h-9 px-3 md:px-4 text-sm shrink-0"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /><span className="hidden sm:inline ml-1">Uploader</span></>}
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => { upload(e.target.files); e.target.value = ""; }}
          />
        </div>
      </div>

      {/* Main area — grid + optional detail panel */}
      <div className={selected ? "grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-4" : ""}>
        {/* Grid */}
        <div>
          {loading ? (
            <div className="card p-16 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
            </div>
          ) : items.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="h-16 w-16 rounded-2xl bg-brand-50 grid place-items-center mx-auto mb-4">
                <Image className="h-8 w-8 text-brand-300" />
              </div>
              <p className="font-semibold text-brand-950 mb-1">Bibliothèque vide</p>
              <p className="text-sm text-brand-500">Uploadez des images ou des vidéos pour commencer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(selected?.id === item.id ? null : item)}
                  className={
                    "group relative overflow-hidden rounded-xl border-2 bg-white transition-all flex flex-col " +
                    (brokenIds.has(item.id)
                      ? "border-red-200 hover:border-red-300"
                      : selected?.id === item.id ? "border-accent shadow-md" : "border-brand-100 hover:border-brand-300 hover:shadow-sm")
                  }
                >
                  <div className="relative aspect-square w-full overflow-hidden">
                    {brokenIds.has(item.id) ? (
                      <div className="h-full w-full flex flex-col items-center justify-center gap-1.5 bg-red-50 text-red-400 px-2 text-center">
                        <AlertTriangle className="h-6 w-6" />
                        <span className="text-[10px] font-medium leading-tight">Fichier introuvable</span>
                      </div>
                    ) : item.type === "image" ? (
                      <NextImage
                        src={item.url}
                        alt={item.filename}
                        fill
                        sizes="200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={() => setBrokenIds((prev) => new Set(prev).add(item.id))}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-brand-900">
                        <Film className="h-8 w-8 text-brand-400" />
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-2 bg-white border-t border-brand-50 w-full text-left">
                    <p className="text-[11px] font-medium text-brand-800 truncate leading-tight">{item.filename}</p>
                    <p className="text-[10px] text-brand-400 mt-0.5">
                      {brokenIds.has(item.id) ? "Supprimez cette entrée — le fichier n'existe plus sur Blob" : `${item.folder} · ${formatSize(item.size_bytes)}`}
                    </p>
                  </div>
                  {selected?.id === item.id && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center shadow">
                      <span className="text-white text-[10px] font-bold">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="space-y-4 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-100">
                <p className="text-sm font-semibold text-brand-950">Détails</p>
                <button type="button" onClick={() => setSelected(null)} className="p-1 text-brand-400 hover:text-brand-900 rounded transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative bg-brand-50 border-b border-brand-100 flex items-center justify-center" style={{ height: "180px" }}>
                {brokenIds.has(selected.id) ? (
                  <div className="flex flex-col items-center gap-1.5 text-red-400">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-xs font-medium">Fichier introuvable sur Blob</span>
                  </div>
                ) : selected.type === "image" ? (
                  <NextImage
                    src={selected.url}
                    alt=""
                    fill
                    sizes="300px"
                    className="object-contain p-3"
                    onError={() => setBrokenIds((prev) => new Set(prev).add(selected.id))}
                  />
                ) : (
                  <video src={selected.url} controls className="max-h-full max-w-full" />
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-400">Nom</p>
                  <p className="text-sm text-brand-900 truncate mt-0.5">{selected.filename}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-400">Type</p>
                    <p className="text-sm text-brand-900 mt-0.5 capitalize">{selected.type}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-400">Dossier</p>
                    <p className="text-sm text-brand-900 mt-0.5">{selected.folder}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-400">Taille</p>
                    <p className="text-sm text-brand-900 mt-0.5">{formatSize(selected.size_bytes)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-400">Date</p>
                    <p className="text-sm text-brand-900 mt-0.5">
                      {new Date(selected.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-400 mb-1">URL</p>
                  <div className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
                    <p className="text-xs text-brand-700 truncate flex-1 font-mono">{selected.url}</p>
                    <button
                      type="button"
                      onClick={() => copyUrl(selected.url)}
                      className="shrink-0 text-brand-400 hover:text-accent transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-700 mt-1">URL copiée !</p>}
                </div>

                <button
                  type="button"
                  onClick={() => deleteItem(selected.id)}
                  disabled={deleting === selected.id}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {deleting === selected.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
