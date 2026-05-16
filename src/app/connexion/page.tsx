"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { sanitizeRedirect } from "@/lib/safeRedirect";

const AUTH_EVENT_KEY = "silvio-auth:event";

export default function LoginPage() {
  const params = useSearchParams();
  const redirect = useMemo(() => sanitizeRedirect(params.get("redirect"), "/compte"), [params]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur");
      }
      localStorage.setItem(AUTH_EVENT_KEY, JSON.stringify({ type: "login", at: Date.now() }));
      window.location.assign(redirect);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "85vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "rgb(250,248,245)" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo + titre */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img src="/logo-04.png" alt="SILVIO STORE" style={{ width: "64px", height: "64px", borderRadius: "999px", margin: "0 auto 16px", display: "block" }} />
          <h1 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#1a1008", margin: "0 0 6px" }}>Connexion</h1>
          <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Accédez à votre compte SILVIO STORE</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid rgba(217,119,6,0.15)", padding: "36px 32px", boxShadow: "0 4px 32px rgba(217,119,6,0.08), 0 1px 4px rgba(0,0,0,0.06)" }}>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                E-mail
              </label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", background: "#faf8f5" }}
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Mot de passe
                </label>
                <Link href="/mot-de-passe-oublie" style={{ fontSize: "12px", color: "#d97706", textDecoration: "none", fontWeight: 600 }}>
                  Oublié ?
                </Link>
              </div>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", background: "#faf8f5" }}
                onFocus={(e) => (e.target.style.borderColor = "#d97706")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.20)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "14px", border: "none", borderRadius: "999px",
                background: loading ? "#9ca3af" : "linear-gradient(135deg, #1a1008, #2c1c06)",
                color: "#fff", fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: loading ? "none" : "0 4px 16px rgba(26,16,8,0.25)",
                transition: "opacity 0.2s",
              }}
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Connexion...</> : "Se connecter"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#f3f4f6" }} />
            <span style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>Nouveau client ?</span>
            <div style={{ flex: 1, height: "1px", background: "#f3f4f6" }} />
          </div>

          <Link href="/inscription" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "12px", borderRadius: "999px",
            border: "1.5px solid rgba(217,119,6,0.40)", color: "#d97706",
            fontSize: "14px", fontWeight: 700, textDecoration: "none",
            transition: "background 0.2s",
          }}>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
