export const revalidate = 3600;

import Link from "next/link";
import { Mail, MapPin, Phone, Clock, MessageSquare } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata = { title: "Contact — SILVIO STORE" };

const CHANNELS = [
  {
    icon: Phone,
    label: "Téléphone",
    value: SITE.contact.phone + (SITE.contact.phone2 ? "\n" + SITE.contact.phone2 : ""),
    href: "tel:" + SITE.contact.phone,
    note: "Lun – Sam, 8 h – 19 h"
  },
  {
    icon: Mail,
    label: "E-mail",
    value: SITE.contact.email,
    href: "mailto:" + SITE.contact.email,
    note: "Réponse sous 24 h"
  },
  {
    icon: MapPin,
    label: "Boutique",
    value: SITE.contact.address,
    href: null,
    note: "Passage bienvenu"
  },
];

export default function ContactPage() {
  return (
    <>
      <div className="bg-brand-950 text-white">
        <div className="container-page py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-2 text-xs text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-brand-200">Contact</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">Nous contacter</h1>
          <p className="mt-3 text-brand-300 max-w-xl">
            Question sur un produit, conseil d'achat, service après-vente — notre équipe est là pour vous.
          </p>
        </div>
      </div>

      <div className="container-page py-14 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {CHANNELS.map((c, i) => {
            const inner = (
              <div className="rounded-2xl border border-brand-100 bg-white p-6 h-full hover:border-accent/40 hover:shadow-md transition-all duration-200 group">
                <div className="h-12 w-12 rounded-xl bg-accent/10 group-hover:bg-accent/15 grid place-items-center text-accent transition-colors mb-5">
                  <c.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">{c.label}</p>
                {c.value.split("\n").map((line, i) => (
                  <p key={i} className="font-semibold text-brand-950 text-sm break-all">{line}</p>
                ))}
                <div className="flex items-center gap-1.5 mt-2">
                  <Clock className="h-3.5 w-3.5 text-brand-400" />
                  <p className="text-xs text-brand-500">{c.note}</p>
                </div>
              </div>
            );
            return c.href
              ? <a key={i} href={c.href}>{inner}</a>
              : <div key={i}>{inner}</div>;
          })}
        </div>

        <div className="grid lg:grid-cols-[1fr,420px] gap-10">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-bold text-brand-950">Envoyez-nous un message</h2>
            </div>

            <form className="space-y-5" action={"mailto:" + SITE.contact.email} method="post" encType="text/plain">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-800 mb-1.5">Nom complet</label>
                  <input name="Nom" required className="input bg-white" placeholder="Votre nom" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-800 mb-1.5">E-mail</label>
                  <input type="email" name="Email" required className="input bg-white" placeholder="votre@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Sujet</label>
                <input name="Sujet" required className="input bg-white" placeholder="De quoi s'agit-il ?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-800 mb-1.5">Message</label>
                <textarea name="Message" required rows={6} className="input bg-white resize-none" placeholder="Décrivez votre demande en détail..." />
              </div>
              <button type="submit" className="btn-primary">Envoyer le message</button>
              <p className="text-xs text-brand-500">Nous vous répondrons dans les 24 heures. Merci de votre confiance.</p>
            </form>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-brand-950 text-white p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Réponse rapide</p>
              <p className="font-semibold text-lg leading-snug">Besoin d'une réponse immédiate ?</p>
              <p className="mt-2 text-brand-300 text-sm leading-relaxed">
                Contactez-nous directement sur WhatsApp pour une assistance en temps réel.
              </p>
              <a
                href={"https://wa.me/" + SITE.contact.phone.replace(/\D/g, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-sm transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.67 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.15-3.41-8.43zM12.06 21.6h-.01a9.72 9.72 0 0 1-4.96-1.36l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.7 9.7 0 0 1-1.48-5.14c0-5.36 4.36-9.73 9.73-9.73a9.67 9.67 0 0 1 6.88 2.85 9.65 9.65 0 0 1 2.85 6.88c0 5.37-4.36 9.73-9.72 9.73zm5.34-7.29c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.15-.17.2-.34.22-.64.07-.29-.15-1.24-.46-2.37-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.03-.51-.07-.15-.66-1.58-.9-2.17-.24-.58-.49-.5-.66-.5l-.56-.01c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43 0 1.43 1.05 2.82 1.2 3.01.15.2 2.07 3.17 5.01 4.44.7.3 1.25.49 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.74-.71 1.98-1.4.24-.69.24-1.27.17-1.4-.07-.12-.27-.2-.56-.34z" />
                </svg>
                Discuter sur WhatsApp
              </a>
            </div>

            <a
              href="https://www.google.com/search?q=SILVIO+STORE+Avis&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOc3j1OA2wPQcuXVfKLbyYgqgULX7xlej7SKORIfTrv3Y-krwCRQyx6Kqih2ytaSsjycNnWAr0ac2IHlond6bhytfAgB_"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-brand-100 bg-white p-7 hover:border-accent/40 hover:shadow-md transition-all"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-3">Votre avis compte</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">⭐⭐⭐⭐⭐</div>
              </div>
              <p className="text-sm font-semibold text-brand-950 mb-1">Laissez un avis Google</p>
              <p className="text-xs text-brand-500">Partagez votre expérience et aidez d&apos;autres clients à nous découvrir.</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                Écrire un avis →
              </span>
            </a>

            <div className="rounded-2xl border border-brand-100 bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-3">Horaires boutique</p>
              <div className="space-y-2 text-sm">
                {[
                  { j: "Lun – Ven", h: "8 h – 19 h" },
                  { j: "Samedi",    h: "9 h – 18 h" },
                  { j: "Dimanche", h: "Sur rendez-vous" },
                ].map((r) => (
                  <div key={r.j} className="flex justify-between">
                    <span className="text-brand-700">{r.j}</span>
                    <span className="font-medium text-brand-950">{r.h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="mt-14">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-4">Nous trouver</p>
          <div className="rounded-2xl overflow-hidden border border-brand-100 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d495.8368726951702!2d1.2393653999999998!3d6.171579299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023e3b2e5de9d93%3A0xb88741022aa66084!2sSILVIO%20STORE!5e0!3m2!1sfr!2stg!4v1778576589663!5m2!1sfr!2stg"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </>
  );
}
