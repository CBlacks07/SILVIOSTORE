"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check } from "lucide-react";

const REASONS = [
  "Produit défectueux",
  "Produit non conforme à la description",
  "Mauvaise taille / mauvais modèle",
  "Produit endommagé à la livraison",
  "Changement d'avis",
  "Autre"
];

export default function RetoursDemandePage() {
  const [form, setForm] = useState({
    order_reference: "",
    email: "",
    reason: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.order_reference || !form.email || !form.reason) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "60px 16px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "999px", background: "rgba(22,163,74,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Check size={32} color="#16a34a" />
        </div>
        <h1 style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "28px", fontWeight: 700, color: "#121826", marginBottom: "12px" }}>Demande envoyée</h1>
        <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: 1.6, marginBottom: "32px" }}>
          Nous avons bien reçu votre demande de retour. Notre équipe vous contactera dans les 48h ouvrées.
        </p>
        <Link href="/" style={{ background: "#1a1008", color: "#fff", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 16px" }}>
      <Link href="/retours" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280", textDecoration: "none", marginBottom: "24px" }}>
        <ArrowLeft size={16} />
        Retour à la politique de retours
      </Link>

      <h1 style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, color: "#121826", marginBottom: "8px" }}>
        Demande de retour
      </h1>
      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "32px", lineHeight: 1.6 }}>
        Renseignez les informations ci-dessous. Notre équipe traitera votre demande sous 48h.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f0ebe3" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#121826", marginBottom: "16px" }}>Informations de commande</h2>
          <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                Référence de commande <span style={{ color: "#d97706" }}>*</span>
              </label>
              <input
                required
                value={form.order_reference}
                onChange={(e) => update("order_reference", e.target.value)}
                placeholder="ex: SLV-2026-XXXX"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", color: "#121826", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                Email utilisé lors de la commande <span style={{ color: "#d97706" }}>*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="votre@email.com"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", color: "#121826", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f0ebe3" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#121826", marginBottom: "16px" }}>Motif du retour</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                Motif <span style={{ color: "#d97706" }}>*</span>
              </label>
              <select
                required
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", color: form.reason ? "#121826" : "#9ca3af", outline: "none", background: "#fff", boxSizing: "border-box" }}
              >
                <option value="">Sélectionnez un motif</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "6px" }}>
                Description (optionnel)
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Décrivez le problème avec plus de détails..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", color: "#121826", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#b91c1c" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ background: "linear-gradient(135deg,#1a1008,#2c1c06)", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Envoi...</> : "Soumettre la demande de retour"}
        </button>
      </form>
    </div>
  );
}
