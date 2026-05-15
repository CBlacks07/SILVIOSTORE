"use client";

import { useState, useEffect } from "react";
import { X, Gift, Mail, Loader2, Check } from "lucide-react";
import type { MarketingSettings } from "@/lib/types";

type Props = { config: MarketingSettings["welcome_popup"] };

const STORAGE_KEY = "silvio_welcome_shown";

export function WelcomePopup({ config }: Props) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), (config.delay_seconds ?? 4) * 1000);
    return () => clearTimeout(t);
  }, [config.delay_seconds]);

  function close() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
    localStorage.setItem(STORAGE_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99990, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", animation: "fadeIn 0.3s ease" }}
      onClick={close}
    >
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(135deg,#1a1008 0%,#2c1c06 60%,#1a1008 100%)", borderRadius: "20px", border: "1px solid rgba(217,119,6,0.30)", boxShadow: "0 32px 80px rgba(0,0,0,0.50)", maxWidth: "480px", width: "100%", overflow: "hidden", animation: "slideUp 0.35s cubic-bezier(0.22,1,0.36,1)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(217,119,6,0.18) 0%,transparent 65%)", pointerEvents: "none" }} />
        <button onClick={close} style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "999px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", zIndex: 2 }}>
          <X size={16} />
        </button>
        <div style={{ padding: "40px 36px 36px", position: "relative", zIndex: 1 }}>
          <div style={{ width: "56px", height: "56px", background: "rgba(217,119,6,0.20)", border: "1px solid rgba(217,119,6,0.40)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <Gift size={26} color="#d97706" />
          </div>
          {!submitted ? (
            <>
              <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", color: "#d97706", marginBottom: "10px" }}>Offre de bienvenue</p>
              <h2 style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(22px,5vw,28px)", fontWeight: 700, color: "#fff", lineHeight: 1.2, margin: "0 0 10px" }}>{config.title}</h2>
              <p style={{ fontSize: "14px", color: "rgba(253,230,138,0.80)", lineHeight: 1.6, marginBottom: "24px" }}>{config.description}</p>
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(217,119,6,0.25)", borderRadius: "10px", padding: "12px 16px" }}>
                  <Mail size={16} color="rgba(253,230,138,0.60)" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px" }} />
                </div>
                <button type="submit" disabled={loading} style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1 }}>
                  {loading ? <Loader2 size={16} /> : `Obtenir mon code ${config.promo_code}`}
                </button>
              </form>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "12px", textAlign: "center" }}>Pas de spam. Désinscription en 1 clic.</p>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ width: "56px", height: "56px", background: "rgba(22,163,74,0.20)", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <Check size={28} color="#16a34a" />
              </div>
              <h2 style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>Votre code est prêt !</h2>
              <div style={{ background: "rgba(217,119,6,0.15)", border: "1px dashed rgba(217,119,6,0.50)", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", color: "#d97706", fontWeight: 700, letterSpacing: "0.2em", marginBottom: "4px" }}>VOTRE CODE</p>
                <p style={{ fontSize: "26px", fontWeight: 900, color: "#fff", letterSpacing: "0.12em", fontFamily: "monospace" }}>{config.promo_code}</p>
              </div>
              <p style={{ fontSize: "13px", color: "rgba(253,230,138,0.80)" }}>Copiez ce code et appliquez-le au moment du paiement.</p>
              <button onClick={close} style={{ marginTop: "20px", background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                Voir le catalogue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
