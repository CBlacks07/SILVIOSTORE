export const dynamic = "force-dynamic";

import Link from "next/link";
import { CheckCircle2, Package, Truck, MessageCircle, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/constants";

export default function ConfirmationPage({
  searchParams,
}: {
  searchParams: { reference?: string };
}) {
  const reference = searchParams.reference;
  const waText = encodeURIComponent(
    `Bonjour SILVIO STORE, je souhaite suivre ma commande ${reference || ""}.`
  );
  const waUrl = `https://wa.me/${SITE.contact.phone.replace(/\D/g, "")}?text=${waText}`;

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "rgb(250,248,245)" }}>
      <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>

        {/* Success icon */}
        <div style={{ width: "80px", height: "80px", borderRadius: "999px", background: "linear-gradient(135deg,#d97706,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 32px rgba(217,119,6,0.35)" }}>
          <CheckCircle2 size={40} color="#fff" />
        </div>

        <p style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.28em", textTransform: "uppercase", color: "#d97706", marginBottom: "12px" }}>
          Commande confirmée
        </p>
        <h1 style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontSize: "clamp(24px,5vw,32px)", fontWeight: 700, color: "#1a1008", lineHeight: 1.2, margin: "0 0 12px" }}>
          Merci pour votre commande !
        </h1>
        <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: 1.6, margin: "0 0 8px" }}>
          Votre paiement a été accepté. Vous recevrez un email de confirmation.
        </p>
        {reference && (
          <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "32px" }}>
            Référence : <strong style={{ color: "#1a1008", fontFamily: "monospace", letterSpacing: "0.05em" }}>{reference}</strong>
          </p>
        )}

        {/* Steps */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0", marginBottom: "32px" }}>
          {[
            { icon: CheckCircle2, label: "Paiement reçu", active: true },
            { icon: Package, label: "Préparation", active: false },
            { icon: Truck, label: "Livraison", active: false },
          ].map(({ icon: Icon, label, active }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "999px", background: active ? "#d97706" : "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={active ? "#fff" : "#9ca3af"} />
                </div>
                <span style={{ fontSize: "10px", fontWeight: 600, color: active ? "#d97706" : "#9ca3af", whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {i < 2 && <div style={{ width: "48px", height: "2px", background: "#e5e7eb", margin: "0 4px 20px" }} />}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reference && (
            <Link href={`/commande/${reference}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg,#1a1008,#2c1c06)", color: "#fff", borderRadius: "10px", padding: "14px 24px", fontWeight: 700, fontSize: "14px", textDecoration: "none" }}>
              <Package size={18} /> Suivre ma commande <ArrowRight size={16} />
            </Link>
          )}
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#16a34a", color: "#fff", borderRadius: "10px", padding: "12px 24px", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}>
            <MessageCircle size={16} /> Contacter sur WhatsApp
          </a>
          <Link href="/catalogue"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", textDecoration: "none" }}>
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
