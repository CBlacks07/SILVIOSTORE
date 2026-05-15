import { getSetting } from "@/lib/settings";
import {
  SiteInfoForm,
  HeaderStripForm,
  HomeHeroForm,
  HomeCtaForm,
  ShippingForm,
  FeaturesForm,
  SocialForm,
  FooterLinksForm,
  TestimonialsForm
} from "@/components/admin/SettingsForms";
import { MarketingForm } from "@/components/admin/MarketingForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [site, headerStrip, homeHero, homeCta, shipping, features, social, footerLinks, testimonials, marketing] = await Promise.all([
    getSetting("site"),
    getSetting("header_strip"),
    getSetting("home_hero"),
    getSetting("home_cta"),
    getSetting("shipping"),
    getSetting("features"),
    getSetting("social"),
    getSetting("footer_links"),
    getSetting("testimonials"),
    getSetting("marketing")
  ]);

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-brand-100">
        <div className="px-4 py-3 md:px-8 md:py-4">
          <div className="flex items-center gap-1.5 text-xs text-brand-400 mb-1">
            <span>Admin</span><span>›</span><span className="text-brand-700 font-medium">Marketing</span>
          </div>
          <h1 className="font-display text-lg md:text-[22px] font-bold text-brand-950">Paramètres du site</h1>
        </div>
      </header>
      <div className="px-4 py-4 md:px-8 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-4 md:gap-6 items-start">
          {/* Forms column */}
          <div className="space-y-6">
            <div id="s-site"><SiteInfoForm initial={site} /></div>
            <div id="s-strip"><HeaderStripForm initial={headerStrip} /></div>
            <div id="s-hero"><HomeHeroForm initial={homeHero} /></div>
            <div id="s-features"><FeaturesForm initial={features} /></div>
            <div id="s-social"><SocialForm initial={social} /></div>
            <div id="s-footer"><FooterLinksForm initial={footerLinks} /></div>
            <div id="s-cta"><HomeCtaForm initial={homeCta} /></div>
            <div id="s-testi"><TestimonialsForm initial={testimonials} /></div>
            <div id="s-marketing"><h2 className="font-display text-lg font-bold text-brand-950 mb-4 mt-2">Marketing &amp; Popups</h2><MarketingForm initial={marketing} /></div>
            <div id="s-ship"><ShippingForm initial={shipping} /></div>
          </div>

          {/* Navigation rapide — hidden on mobile, sticky on lg */}
          <div className="hidden lg:block sticky top-24 space-y-4">
            <div className="rounded-xl border border-brand-100 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-3">Navigation</p>
              <nav className="space-y-1">
                {[
                  { label: "Informations de la boutique", id: "s-site" },
                  { label: "Bandeau header",              id: "s-strip" },
                  { label: "Bannière principale",         id: "s-hero" },
                  { label: "Avantages",                   id: "s-features" },
                  { label: "Réseaux sociaux",             id: "s-social" },
                  { label: "Liens footer",                id: "s-footer" },
                  { label: "Appel à l'action",            id: "s-cta" },
                  { label: "Témoignages",                 id: "s-testi" },
                  { label: "Livraison",                   id: "s-ship" },
                ].map(({ label, id }) => (
                  <a
                    key={id}
                    href={"#" + id}
                    className="block px-2 py-1.5 text-sm text-brand-600 hover:text-brand-950 hover:bg-brand-50 rounded transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <p className="text-xs font-semibold text-accent mb-1">Astuce</p>
              <p className="text-xs text-brand-600 leading-relaxed">
                Les modifications sont sauvegardées section par section. Cliquez sur "Enregistrer" dans chaque section après modification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
