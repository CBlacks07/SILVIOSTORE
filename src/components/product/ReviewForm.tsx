"use client";

import { useRef, useState } from "react";
import { Camera, Star, Loader2, X } from "lucide-react";

type Props = { productId: string; canReview: boolean; isLoggedIn: boolean };

export function ReviewForm({ productId, canReview, isLoggedIn }: Props) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload?folder=site", { method: "POST", body: fd });
      const data = await res.json();
      if (data.urls) setPhotos((prev) => [...prev, ...data.urls].slice(0, 3));
    } catch {}
    setUploading(false);
  }

  async function submit() {
    setBusy(true); setMessage(null); setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment, photos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessage("Merci ! Votre avis a été enregistré et sera publié après validation.");
      setComment(""); setPhotos([]); setRating(5);
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setBusy(false);
    }
  }

  if (!isLoggedIn) return (
    <p className="text-sm text-brand-600">
      <a href="/connexion" className="text-accent font-semibold hover:underline">Connectez-vous</a> pour laisser un avis.
    </p>
  );

  if (!canReview) return (
    <p className="text-sm text-brand-600">Les avis sont réservés aux clients ayant acheté cet accessoire.</p>
  );

  const displayRating = hovered || rating;

  return (
    <div className="space-y-5">
      {/* Stars */}
      <div>
        <label className="block text-sm font-semibold text-brand-900 mb-2">Votre note</label>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <button key={n} type="button"
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}
            >
              <Star size={28} fill={n <= displayRating ? "#d97706" : "none"} color={n <= displayRating ? "#d97706" : "#d1d5db"} strokeWidth={1.5} />
            </button>
          ))}
          <span className="ml-2 text-sm text-brand-600 self-center">{rating}/5</span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-semibold text-brand-900 mb-2">Commentaire <span className="font-normal text-brand-400">(optionnel)</span></label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
          className="input resize-none" placeholder="Partagez votre expérience avec cet accessoire..." />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-semibold text-brand-900 mb-2">
          Photos <span className="font-normal text-brand-400">(optionnel, max 3)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {photos.map((url, i) => (
            <div key={url} style={{ position: "relative", width: "72px", height: "72px", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                style={{ position: "absolute", top: "2px", right: "2px", background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "999px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={10} />
              </button>
            </div>
          ))}
          {photos.length < 3 && (
            <button type="button" onClick={() => fileRef.current?.click()}
              style={{ width: "72px", height: "72px", borderRadius: "10px", border: "1.5px dashed rgba(217,119,6,0.40)", background: "rgba(217,119,6,0.05)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "4px", color: "#d97706" }}>
              {uploading ? <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> : <Camera size={18} />}
              <span style={{ fontSize: "9px", fontWeight: 600 }}>Ajouter</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhoto(e.target.files)} />
      </div>

      <button type="button" onClick={submit} disabled={busy} className="btn-primary">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi...</> : "Publier mon avis"}
      </button>

      {message && <p className="text-sm text-green-700 font-medium">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
