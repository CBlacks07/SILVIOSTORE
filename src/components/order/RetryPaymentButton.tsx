"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  reference: string;
  compact?: boolean;
};

export function RetryPaymentButton({ reference, compact = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retryPayment() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${reference}/retry-payment`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impossible de relancer le paiement.");
      window.location.href = data.paymentUrl;
    } catch (e: any) {
      setError(e.message || "Impossible de relancer le paiement.");
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <div className="inline-flex flex-col items-end gap-1">
        <button type="button" onClick={retryPayment} disabled={loading} className="btn-outline px-2.5 py-1 text-xs">
          {loading ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Redirection...</> : "Payer maintenant"}
        </button>
        {error && <p className="max-w-52 text-right text-[11px] text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      <button type="button" onClick={retryPayment} disabled={loading} className="btn-accent">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirection...</> : "Réessayer le paiement"}
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
