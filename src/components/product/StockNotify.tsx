"use client";

import { useState } from "react";
import { Bell, Loader2, Check } from "lucide-react";

export function StockNotify({ productId, productName }: { productId: string; productName: string }) {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), productId, productName }),
      });
      setDone(true);
    } catch {}
    setLoading(false);
  }

  if (done) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)", borderRadius: "10px" }}>
        <Check size={16} color="#16a34a" />
        <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 600 }}>Vous serez notifié dès que le produit est disponible.</span>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "999px", border: "1.5px solid rgba(217,119,6,0.35)", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "#d97706", transition: "all 0.15s" }}
        >
          <Bell size={15} />
          Me prévenir quand disponible
        </button>
      ) : (
        <form onSubmit={submit} style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            autoFocus
            style={{ flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid rgba(217,119,6,0.30)", fontSize: "13px", outline: "none", background: "#faf8f5" }}
          />
          <button type="submit" disabled={loading}
            style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            {loading ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <><Bell size={14} />Notifier</>}
          </button>
          <button type="button" onClick={() => setOpen(false)}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#6b7280" }}>
            Annuler
          </button>
        </form>
      )}
    </div>
  );
}
