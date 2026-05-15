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
    { icon: Facebook, url: social.facebook },
    { icon: Instagram, url: social.instagram },
    { icon: Twitter, url: social.twitter },
    { icon: MessageCircle, url: social.whatsapp }, // WhatsApp fallback
  ].filter(s => !!s.url);

  return (
    <footer className="mt-20 text-brand-200" style={{ background: "linear-gradient(180deg, #1a1008 0%, #120c04 100%)", borderTop: "1px solid rgba(217,119,6,0.15)" }}>
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-5">
            {(site.logo_footer_url || site.logo_url) && (
              <img
                src={site.logo_footer_url || site.logo_url}
                alt={brandName}
                style={{ width: "72px", height: "72px", borderRadius: "999px", objectFit: "cover", flexShrink: 0 }}
              />
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
                  <s.icon className="h-5 w-5" />
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
              <MapPin className="mt-0.5 h-4 w-4 text-brand-400" />
              {site.address}
            </li>
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-brand-400 shrink-0" />
              <span>
                {site.phone}
                {site.phone2 && <><br />{site.phone2}</>}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-brand-400" />
              {site.email}
            </li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(217,119,6,0.12)" }}>
        <div className="container-page py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">Nous trouver</p>
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
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-brand-400 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} {brandName}. Tous droits réservés.</span>
          <span>Paiement sécurisé via FedaPay</span>
        </div>
      </div>
    </footer>
  );
}
