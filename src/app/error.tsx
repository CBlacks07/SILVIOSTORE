"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error.message, "digest:", error.digest);
  }, [error]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
      <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", color: "#d97706", marginBottom: "12px" }}>
        Une erreur est survenue
      </p>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#1a1008", marginBottom: "16px" }}>
        Cette page ne peut pas s&apos;afficher
      </h2>
      {error.digest && (
        <p style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace", marginBottom: "24px" }}>
          Code : {error.digest}
        </p>
      )}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={reset} style={{ background: "#d97706", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
          Réessayer
        </button>
        <Link href="/" style={{ background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 20px", textDecoration: "none", fontWeight: 600 }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
