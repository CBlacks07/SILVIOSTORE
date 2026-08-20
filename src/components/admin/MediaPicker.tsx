"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import NextImage from "next/image";
import { AlertTriangle, Film, Image, Loader2, Search, Upload, X } from "lucide-react";
import { readUploadResponse } from "@/lib/utils";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  type: "image" | "video";
  size_bytes: number | null;
  folder: string;
  created_at: string;
};

type Props = {
  onSelect: (url: string) => void;
  onClose: () => void;
  accept?: "image" | "video" | "all";
  folder?: string;
};

const FOLDERS = ["products", "site", "brands", "banners", "general"];

export function MediaPicker({ onSelect, onClose, accept = "image", folder: defaultFolder = "general" }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [folderFilter, setFolderFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState(defaultFolder);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [mounted, setMounted] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  // Fichiers dont l'URL Blob ne répond plus (supprimés hors de cette appli) —
  // on les grise plutôt que de laisser choisir une image morte.
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (accept !== "all") params.set("type", accept);
    if (folderFilter) params.set("folder", folderFilter);
    if (q) params.set("q", q);
    const res = await fetch("/api/admin/media?" + params.toString());
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [accept, folderFilter, q]);

  useEffect(() => { load(); }, [folderFilter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function upload() {
    if (!pendingFiles || pendingFiles.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      pendingFiles.forEach((f) => fd.append("files", f));
      const isVideo = pendingFiles.some((f) => f.type.startsWith("video/"));
      const res = await fetch(
        `/api/admin/upload?folder=${uploadFolder}${isVideo ? "&type=video" : ""}`,
        { method: "POST", body: fd }
      );
      await readUploadResponse(res);
      await load();
      setTab("library");
      setPendingFiles(null);
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFileChange(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setPendingFiles(Array.from(files));
    if (inputRef.current) inputRef.current.value = "";
  }

  if (!mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100 shrink-0">
          <div className="flex items-center gap-1 border border-brand-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={"px-3 py-1.5 text-sm font-medium rounded-md transition-colors " +
                (tab === "library" ? "bg-brand-950 text-white" : "text-brand-600 hover:text-brand-950")}
            >
              Bibliothèque
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={"px-3 py-1.5 text-sm font-medium rounded-md transition-colors " +
                (tab === "upload" ? "bg-brand-950 text-white" : "text-brand-600 hover:text-brand-950")}
            >
              Uploader
            </button>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-brand-400 hover:text-brand-900 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {tab === "upload" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
            {!pendingFiles ? (
              <>
                <div className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-brand-50 grid place-items-center mx-auto mb-4">
                    <Upload className="h-7 w-7 text-brand-400" />
                  </div>
                  <h3 className="font-semibold text-brand-950 mb-1">Uploader un fichier</h3>
                  <p className="text-sm text-brand-500">Le fichier sera ajouté à la bibliothèque et sélectionné automatiquement.</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="input w-full sm:w-auto"
                  >
                    {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>

                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="btn-accent w-full sm:w-auto justify-center"
                  >
                    <Upload className="h-4 w-4" />Choisir un fichier
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-green-50 grid place-items-center mx-auto mb-4">
                    <Upload className="h-7 w-7 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-brand-950 mb-1">
                    {pendingFiles.length} fichier{pendingFiles.length > 1 ? "s" : ""} sélectionné{pendingFiles.length > 1 ? "s" : ""}
                  </h3>
                  <ul className="mt-2 space-y-1">
                    {pendingFiles.map((f) => (
                      <li key={f.name} className="text-sm text-brand-600 truncate max-w-xs mx-auto">{f.name}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xs sm:max-w-none">
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="input w-full sm:w-auto"
                  >
                    {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => { setPendingFiles(null); }}
                      className="btn-outline flex-1 sm:flex-none justify-center"
                    >
                      Annuler
                    </button>

                    <button
                      type="button"
                      onClick={upload}
                      disabled={uploading}
                      className="btn-accent flex-1 sm:flex-none justify-center"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
                    </button>
                  </div>
                </div>

                {uploadError && <p className="text-sm text-red-700 text-center max-w-sm">{uploadError}</p>}
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              multiple
              accept={accept === "video" ? "video/*" : accept === "image" ? "image/*" : "image/*,video/*"}
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="px-6 py-3 border-b border-brand-100 flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-1 rounded-lg border border-brand-200 bg-brand-50 px-3 h-9">
                <Search className="h-4 w-4 text-brand-400 shrink-0" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Rechercher..."
                  className="flex-1 bg-transparent text-sm border-0 focus:outline-none placeholder-brand-400"
                />
              </div>
              <select
                value={folderFilter}
                onChange={(e) => setFolderFilter(e.target.value)}
                className="input h-9 py-0 text-sm"
              >
                <option value="">Tous les dossiers</option>
                {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <Image className="h-10 w-10 text-brand-200 mb-3" />
                  <p className="text-sm text-brand-500">Aucun fichier trouvé.</p>
                  <button
                    type="button"
                    onClick={() => setTab("upload")}
                    className="mt-3 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                  >
                    Uploader le premier fichier
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
                  {items.map((item) => {
                    const broken = brokenIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={broken}
                        onClick={() => { onSelect(item.url); onClose(); }}
                        className={
                          "group relative overflow-hidden rounded-xl border-2 bg-brand-50 transition-all " +
                          (broken ? "border-red-200 cursor-not-allowed" : "border-brand-100 hover:border-accent")
                        }
                      >
                        <div className="relative aspect-square">
                          {broken ? (
                            <div className="h-full w-full flex flex-col items-center justify-center gap-1 bg-red-50 text-red-400 px-2 text-center">
                              <AlertTriangle className="h-5 w-5" />
                              <span className="text-[9px] font-medium leading-tight">Fichier introuvable</span>
                            </div>
                          ) : item.type === "image" ? (
                            <NextImage
                              src={item.url}
                              alt={item.filename}
                              fill
                              sizes="150px"
                              className="object-cover"
                              onError={() => setBrokenIds((prev) => new Set(prev).add(item.id))}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-brand-900">
                              <Film className="h-6 w-6 text-brand-400" />
                            </div>
                          )}
                        </div>
                        {!broken && (
                          <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 bg-accent text-white text-[11px] font-bold px-2 py-1 rounded-full transition-opacity">
                              Sélectionner
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-brand-100 shrink-0 text-xs text-brand-400">
              {items.length} fichier{items.length > 1 ? "s" : ""} — Cliquez pour sélectionner
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
