import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";
import { sql } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { sanitizeSiteName } from "@/lib/siteBrand";
import type { Category } from "@/lib/types";

export async function Footer() {
  const [site, categories, social, footerLinks] = await Promise.all([
    getSetting("site"),
    sql<Pick<Category, "slug" | "name">[]>`
      select slug, name from categories
      order by
        case
          when lower(slug) like '%smartphone%' or lower(name) like '%smartphone%' then 1
          when lower(slug) like '%telephone%' or lower(name) like '%telephone%' then 1
          else 0
        end asc,
        sort_order asc,
        name asc
    `,
    getSetting("social"),
    getSetting("footer_links")
  ]);

  const brandName = sanitizeSiteName(site.name) || "SILVIO STORE";

  const socialLinks = [
    { icon: Facebook, url: social.facebook, type: "lucide" },
    { icon: Instagram, url: social.instagram, type: "lucide" },
    { icon: Twitter, url: social.twitter, type: "lucide" },
    { icon: MessageCircle, url: social.whatsapp, type: "lucide" },
    { icon: null, url: social.tiktok, type: "tiktok" },
  ].filter(s => !!s.url);

  return (
    <footer className="mt-20 text-brand-200" style={{ background: "linear-gradient(180deg, #1a1008 0%, #120c04 100%)", borderTop: "1px solid rgba(217,119,6,0.15)" }}>
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-5">
            {(site.logo_footer_url || site.logo_url) && (
              <div className="relative shrink-0" style={{ width: "64px", height: "64px", borderRadius: "999px", overflow: "hidden" }}>
                <Image src={site.logo_footer_url || site.logo_url} alt={brandName} fill className="object-cover" sizes="64px" />
              </div>
            )}
            <div className="font-display text-lg font-bold text-white leading-tight">
              {brandName}
            </div>
          </div>
          <p className="text-sm text-brand-300">{site.description}</p>
          
          {socialLinks.length > 0 && (
            <div className="mt-6 flex gap-4">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-white transition-colors">
                  {s.type === "tiktok" ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                    </svg>
                  ) : (
                    s.icon && <s.icon className="h-5 w-5" />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Catégories</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={"/catalogue?categorie=" + c.slug} className="text-brand-300 hover:text-white transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Informations</h4>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.links.map((link: any, i: number) => (
              <li key={i}>
                <Link href={link.url} className="text-brand-300 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-brand-400 shrink-0" />
              <a
                href="https://maps.google.com/?q=SILVIO+STORE+Lomé+Nukafu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-300 hover:text-white transition-colors"
              >
                {site.address}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-brand-400 shrink-0" />
              <span>
                <a href={"tel:" + site.phone.replace(/\s/g, "")} className="text-brand-300 hover:text-white transition-colors block">
                  {site.phone}
                </a>
                {site.phone2 && (
                  <a href={"tel:" + site.phone2.replace(/\s/g, "")} className="text-brand-300 hover:text-white transition-colors block">
                    {site.phone2}
                  </a>
                )}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-brand-400 shrink-0" />
              <a href={"mailto:" + site.email} className="text-brand-300 hover:text-white transition-colors">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(217,119,6,0.12)" }}>
        <div className="container-page py-8">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Nous trouver</p>
            <a
              href="https://www.google.com/search?q=SILVIO+STORE+Avis&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOc3j1OA2wPQcuXVfKLbyYgqgULX7xlej7SKORIfTrv3Y-krwCRQyx6Kqih2ytaSsjycNnWAr0ac2IHlond6bhytfAgB_"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.30)", fontSize: "11px", fontWeight: 700, color: "#d97706", textDecoration: "none" }}
            >
              ★ Laisser un avis Google
            </a>
          </div>
          <div className="overflow-hidden rounded-xl" style={{ height: "220px" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d495.8368726951702!2d1.2393653999999998!3d6.171579299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023e3b2e5de9d93%3A0xb88741022aa66084!2sSILVIO%20STORE!5e0!3m2!1sfr!2stg!4v1778576589663!5m2!1sfr!2stg"
              width="100%"
              height="220"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(217,119,6,0.12)" }}>
        <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-brand-400">&copy; {new Date().getFullYear()} {brandName}. Tous droits réservés.</span>
          <div className="flex items-center gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" as any }}>
            {[
              { src: "/yas.jpg",             alt: "YAS Togo" },
              { src: "/moov money.jpg",      alt: "Moov Money" },
              { src: "/wave.jpg",            alt: "Wave" },
              { src: "/mtn.jpg",             alt: "MTN Money" },
              { src: "/visa-mastercard.jpg", alt: "Visa / Mastercard" },
            ].map(({ src, alt }) => (
              <div key={alt} className="relative shrink-0 h-7 w-14 overflow-hidden rounded" style={{ background: "rgba(255,255,255,0.08)" }}>
                <Image src={src} alt={alt} fill className="object-contain p-0.5" sizes="56px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
