export const revalidate = 3600;
export const metadata = { title: "Contact — SILVIO STORE" };

import Link from "next/link";
import { Mail, MapPin, Phone, Clock, Star } from "lucide-react";
import { SITE } from "@/lib/constants";
import { ContactForm } from "@/components/contact/ContactForm";

export default function ContactPage() {
  const waUrl = "https://wa.me/" + SITE.contact.phone.replace(/\D/g, "");

  return (
    <>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 100%)" }} className="text-white">
        <div className="container-page py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-2 text-xs" style={{ color: "rgba(253,230,138,0.65)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span style={{ color: "#d97706" }}>/</span>
            <span style={{ color: "rgba(253,230,138,0.90)" }}>Contact</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight text-white">Nous contacter</h1>
          <p className="mt-3 text-sm max-w-lg" style={{ color: "rgba(253,230,138,0.80)" }}>
            Question sur un produit, conseil d&apos;achat, service après-vente — notre équipe est là pour vous.
          </p>
        </div>
      </div>

      <div className="container-page py-16 max-w-5xl">

        {/* Canaux de contact */}
        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {[
            { icon: Phone, label: "Téléphone", lines: [SITE.contact.phone, SITE.contact.phone2].filter(Boolean) as string[], note: "Lun – Sam, 8h – 19h", href: "tel:" + SITE.contact.phone },
            { icon: Mail,  label: "E-mail",    lines: [SITE.contact.email], note: "Réponse sous 24h",  href: "mailto:" + SITE.contact.email },
            { icon: MapPin,label: "Boutique",  lines: [SITE.contact.address], note: "Passage bienvenu", href: "https://maps.google.com/?q=SILVIO+STORE+Lomé+Nukafu" },
          ].map(({ icon: Icon, label, lines, note, href }) => (
            <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
              className="p-6 hover:shadow-md transition-all rounded-2xl"
              style={{ background: "#fff", textDecoration: "none" }}
            >
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(217,119,6,0.10)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <p style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "#9ca3af", marginBottom: "4px" }}>{label}</p>
              {lines.map((l, i) => <p key={i} style={{ fontSize: "13px", fontWeight: 600, color: "#1a1008", lineHeight: 1.4 }}>{l}</p>)}
              <div className="flex items-center gap-1.5 mt-2">
                <Clock className="h-3 w-3 text-brand-400" />
                <p style={{ fontSize: "11px", color: "#9ca3af" }}>{note}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Grille principale */}
        <div className="grid lg:grid-cols-[1fr,360px] gap-10">

          {/* Formulaire */}
          <div className="p-6 md:p-10 rounded-2xl" style={{ background: "#fff" }}>
            <h2 className="font-display text-xl font-bold text-brand-950 mb-6">Envoyez-nous un message</h2>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* WhatsApp */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1008, #2c1c06)", border: "1px solid rgba(217,119,6,0.25)" }}>
              <div className="p-6">
                <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#d97706", marginBottom: "8px" }}>Réponse rapide</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>Besoin d&apos;une réponse immédiate ?</p>
                <p style={{ fontSize: "13px", color: "rgba(253,230,138,0.75)", lineHeight: 1.6 }}>Écrivez-nous sur WhatsApp — on répond en quelques minutes.</p>
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-wa-pill mt-4" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <svg viewBox="0 0 24 24" style={{ width: "16px", height: "16px", fill: "#fff", flexShrink: 0 }}>
                    <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.67 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.15-3.41-8.43z" />
                  </svg>
                  Discuter sur WhatsApp
                </a>
              </div>
            </div>

            {/* Horaires */}
            <div className="p-5 rounded-2xl" style={{ background: "#fff" }}>
              <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "12px" }}>Horaires boutique</p>
              {[
                { j: "Lun – Ven", h: "8 h – 19 h" },
                { j: "Samedi",    h: "9 h – 18 h" },
                { j: "Dimanche",  h: "Sur rendez-vous" },
              ].map((r) => (
                <div key={r.j} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>{r.j}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1008" }}>{r.h}</span>
                </div>
              ))}
            </div>

            {/* Avis Google */}
            <a
              href="https://www.google.com/search?q=SILVIO+STORE+Avis&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOc3j1OA2wPQcuXVfKLbyYgqgULX7xlej7SKORIfTrv3Y-krwCRQyx6Kqih2ytaSsjycNnWAr0ac2IHlond6bhytfAgB_"
              target="_blank" rel="noopener noreferrer"
              className="p-5 block hover:shadow-md transition-all rounded-2xl"
              style={{ textDecoration: "none", background: "#fff" }}
            >
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#d97706" color="#d97706" />)}
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#1a1008", marginBottom: "4px" }}>Laissez un avis Google</p>
              <p style={{ fontSize: "12px", color: "#9ca3af" }}>Aidez d&apos;autres clients à nous découvrir.</p>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#d97706", marginTop: "8px" }}>Écrire un avis →</p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
