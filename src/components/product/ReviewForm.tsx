"use client";

import { useState } from "react";

type Props = {
  productId: string;
  canReview: boolean;
  isLoggedIn: boolean;
};

export function ReviewForm({ productId, canReview, isLoggedIn }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMessage("Merci. Votre avis a bien été enregistré.");
      setComment("");
    } catch (e: any) {
      setError(e.message || "Erreur");
    } finally {
      setBusy(false);
    }
  }

  if (!isLoggedIn) {
    return <p className="text-sm text-brand-600">Connectez-vous pour laisser un avis.</p>;
  }

  if (!canReview) {
    return <p className="text-sm text-brand-600">Avis réservé aux clients ayant acheté cet accessoire.</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Votre note</label>
        <div className="inline-flex rounded-md border border-brand-200 p-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={
                "rounded px-2 py-1 text-sm " +
                (rating === n ? "bg-brand-900 text-white" : "text-brand-700 hover:bg-brand-50")
              }
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-900">Commentaire (optionnel)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="input"
          placeholder="Dites-nous ce que vous avez aimé sur cet accessoire."
        />
      </div>

      <button type="button" onClick={submit} disabled={busy} className="btn-primary">
        {busy ? "Enregistrement..." : "Publier mon avis"}
      </button>

      {message && <p className="text-sm text-green-700">{message}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

