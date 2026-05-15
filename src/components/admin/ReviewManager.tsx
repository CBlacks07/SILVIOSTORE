"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";

type ReviewRow = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  product_name: string;
  product_slug: string;
};

export function ReviewManager({ initial }: { initial: ReviewRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  async function toggleApprove(id: string, value: boolean) {
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: value })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_approved: data.is_approved } : r)));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function removeReview(id: string) {
    if (!confirm("Supprimer cet avis ?")) return;
    setError(null);
    try {
      const res = await fetch("/api/admin/reviews/" + id, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");

      setRows((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-700">{error}</p>}

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50/60 text-left text-brand-500">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Produit</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Auteur</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Note</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Commentaire</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-brand-100 last:border-0 hover:bg-brand-50/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={"/produit/" + r.product_slug} className="font-medium text-brand-900 hover:text-accent">
                    {r.product_name}
                  </Link>
                  <p className="text-xs text-brand-500">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                </td>
                <td className="px-4 py-3 text-brand-700">
                  {r.author_name}
                  {r.is_verified_purchase && <p className="text-xs text-emerald-700">Achat vérifié</p>}
                </td>
                <td className="px-4 py-3 text-brand-900">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</td>
                <td className="px-4 py-3 text-brand-700 max-w-xs">
                  <p className="truncate">{r.comment || "—"}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={"badge " + (r.is_approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
                    {r.is_approved ? "Publié" : "Masqué"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-3">
                    {r.is_approved ? (
                      <button
                        type="button"
                        onClick={() => toggleApprove(r.id, false)}
                        className="text-amber-700 hover:text-amber-800"
                        title="Masquer l'avis"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleApprove(r.id, true)}
                        className="text-emerald-700 hover:text-emerald-800"
                        title="Publier l'avis"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeReview(r.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-brand-500">
                  Aucun avis client pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={"/produit/" + r.product_slug} className="font-medium text-brand-900 hover:text-accent text-sm truncate block">
                  {r.product_name}
                </Link>
                <p className="text-xs text-brand-500">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {r.is_approved ? (
                  <button
                    type="button"
                    onClick={() => toggleApprove(r.id, false)}
                    className="text-amber-700 hover:text-amber-800"
                    title="Masquer"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleApprove(r.id, true)}
                    className="text-emerald-700 hover:text-emerald-800"
                    title="Publier"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeReview(r.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-brand-700 font-medium">{r.author_name}</span>
                {r.is_verified_purchase && <span className="ml-2 text-xs text-emerald-700">Achat vérifié</span>}
              </div>
              <span className="text-brand-900">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            {r.comment && (
              <p className="text-xs text-brand-600 leading-relaxed">{r.comment}</p>
            )}
            <div>
              <span className={"badge text-[10px] " + (r.is_approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800")}>
                {r.is_approved ? "Publié" : "Masqué"}
              </span>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="card px-4 py-8 text-center text-brand-500">
            Aucun avis client pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
