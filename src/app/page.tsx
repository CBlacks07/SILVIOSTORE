import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { sql } from "@/lib/db";
import { ProductCard } from "@/components/product/ProductCard";
import { Hero } from "@/components/home/Hero";
import { MarqueeStrip } from "@/components/ui/MarqueeStrip";
import { Reveal } from "@/components/ui/Reveal";
import { BrandLogo } from "@/components/home/BrandLogo";
import { WhySilvioStore } from "@/components/home/WhySilvioStore";
import { Testimonials } from "@/components/home/Testimonials";
import { CategoriesMarquee } from "@/components/home/CategoriesMarquee";
import { SelectionStrip } from "@/components/home/SelectionStrip";
import { BannerCard } from "@/components/ui/BannerCard";
import { BannerSlider } from "@/components/ui/BannerSlider";
import { getFeaturedProducts } from "@/lib/queries";
import { getSetting, listActiveBanners, listActiveBrands } from "@/lib/settings";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, hero, cta, topBanners, brands, features, testimonials, midBanners] = await Promise.all([
    getFeaturedProducts(8),
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
    getSetting("home_hero"),
    getSetting("home_cta"),
    listActiveBanners("home_hero"),
    listActiveBrands(),
    getSetting("features"),
    getSetting("testimonials"),
    listActiveBanners("home_mid")
  ]);

  const heroExtraImages = topBanners.map((b) => b.image_url).filter((u): u is string => !!u);

  return (
    <>
      <Hero hero={hero} extraImages={heroExtraImages} />
      <MarqueeStrip />

      {features?.enabled && (
        <Reveal as="section" className="container-page py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {(features.items || []).map((item: any) => {
            const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Package;
            return (
              <div key={item.title} className="card card-hover px-4 py-3 flex items-center gap-3" style={{ borderColor: "rgba(217,119,6,0.15)" }}>
                <div className="rounded-lg bg-gradient-to-br from-accent/15 to-accent/5 p-2 text-accent ring-1 ring-accent/15 shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-brand-950 text-sm">{item.title}</p>
                  <p className="text-xs text-brand-600 truncate">{item.text}</p>
                </div>
              </div>
            );
          })}
        </Reveal>
      )}

      {/* Bannières admin */}
      {topBanners.filter(b => b.image_url || b.title).length > 0 && (
        <>
          {/* Desktop: slider pleine largeur */}
          <div className="hidden md:block">
            <BannerSlider banners={topBanners.filter(b => b.image_url || b.title)} />
          </div>
          {/* Mobile: cards */}
          <section className="md:hidden container-page py-8">
            <div className="grid gap-4">
              {topBanners.filter(b => b.image_url || b.title).map(b => <BannerCard key={b.id} banner={b} />)}
            </div>
          </section>
        </>
      )}

      <section className="container-page py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mb-2">Catalogue</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-950 tracking-tight">Nos catégories</h2>
          </div>
          <Link href="/catalogue" className="hidden sm:btn-hero-outline">
            Tout voir
          </Link>
        </div>
        <CategoriesMarquee categories={categories} />
      </section>

      <Reveal as="section" className="container-page py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mb-2">Sélection</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-950 tracking-tight">Notre sélection du moment</h2>
            <p className="mt-1 text-sm text-brand-600">Luxe, tendance et protection — les pièces que nos clients adorent.</p>
          </div>
          <Link href="/catalogue" className="hidden sm:btn-hero-outline">
            Voir tout
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="card p-10 text-center text-sm text-brand-500">
            Aucun produit vedette pour le moment. Connectez-vous à l'admin pour en ajouter.
          </div>
        ) : (
          <SelectionStrip products={featured} />
        )}
      </Reveal>

      {brands.length > 0 && (
        <section className="py-14 overflow-hidden" style={{ borderTop: "1px solid rgba(217,119,6,0.10)", borderBottom: "1px solid rgba(217,119,6,0.10)" }}>
          <div className="container-page text-center mb-10">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mb-3">Marques</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-950 tracking-tight">
              Les grandes marques, à portée de main.
            </h2>
            <p className="mt-3 text-sm text-brand-600">Originaux, compatibles et garantis dans la sous région.</p>
          </div>
          <div style={{ position: "relative", overflow: "hidden" }}>
            {/* Fade edges */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, rgb(250,248,245), transparent)", zIndex: 1, pointerEvents: "none" }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, rgb(250,248,245), transparent)", zIndex: 1, pointerEvents: "none" }} />
            <style>{`
              @keyframes brands-scroll {
                from { transform: translateX(0); }
                to   { transform: translateX(-50%); }
              }
              .brands-marquee {
                display: flex;
                align-items: center;
                gap: clamp(40px, 6vw, 80px);
                animation: brands-scroll 22s linear infinite;
                will-change: transform;
                width: max-content;
              }
              .brands-marquee:hover { animation-play-state: paused; }
            `}</style>
            <div className="brands-marquee" style={{ padding: "8px 0" }}>
              {[...brands, ...brands].map((b, i) => (
                <div key={b.id + i} style={{ flexShrink: 0 }}>
                  <BrandLogo name={b.name} logo_url={b.logo_url} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <WhySilvioStore />

      <Testimonials data={testimonials} />

      {/* Bannières milieu */}
      {midBanners.filter(b => b.image_url || b.title).length > 0 && (
        <>
          <div className="hidden md:block mt-6">
            <BannerSlider banners={midBanners.filter(b => b.image_url || b.title)} />
          </div>
          <section className="md:hidden container-page py-8">
            <div className="grid gap-4">
              {midBanners.filter(b => b.image_url || b.title).map(b => <BannerCard key={b.id} banner={b} />)}
            </div>
          </section>
        </>
      )}

      {/* CTA + SEO — full width */}
      <section className="mt-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 60%, #1a1008 100%)" }}
      >
          {/* Gold glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 5% 30%, rgba(217,119,6,0.18) 0%, transparent 55%), radial-gradient(ellipse at 95% 70%, rgba(217,119,6,0.10) 0%, transparent 55%)" }} />

          {/* Top — CTA */}
          {cta.enabled && (
            <div className="container-page" style={{ paddingTop: "clamp(40px, 6vw, 64px)", paddingBottom: "32px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
              <div className="flex-1">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white">{cta.title}</h3>
                <p className="mt-2 text-sm leading-relaxed max-w-xl" style={{ color: "rgba(253,230,138,0.85)" }}>{cta.text}</p>
              </div>
              {cta.cta_label && cta.cta_link && (
                <Link href={cta.cta_link} className="btn-accent shrink-0 self-start sm:self-auto">{cta.cta_label}</Link>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="container-page"><div style={{ height: "1px", background: "rgba(217,119,6,0.20)" }} /></div>

          {/* Bottom — SEO 3 colonnes */}
          <div className="container-page" style={{ paddingTop: "32px", paddingBottom: "clamp(40px, 6vw, 56px)", display: "grid", gap: "32px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {[
              { title: "Pochettes de luxe & coques originales", text: "Sélection premium de pochettes et coques pour iPhone, Samsung et tous modèles. Designs exclusifs, matériaux haut de gamme — protection et style réunis." },
              { title: "Accessoires authentiques & garantis", text: "Bracelets Apple Watch cuir, chargeurs rapides USB-C, verres trempés — chaque accessoire est vérifié, original et garanti avant expédition." },
              { title: "Livraison dans toute la sous région", text: "Lomé-Nukafu, Togo. Livraison au Bénin, Ghana, Côte d'Ivoire, Sénégal, Burkina Faso et plus. Paiement Mobile Money accepté." },
            ].map(({ title, text }) => (
              <div key={title}>
                <h3 style={{ fontSize: "13px", fontWeight: 700, color: "#d97706", margin: "0 0 8px", letterSpacing: "0.01em" }}>{title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(253,230,138,0.70)", lineHeight: 1.65, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>

        {/* FAQ Schema pour Google */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Où acheter des pochettes de luxe pour téléphone au Togo ?",
              "acceptedAnswer": { "@type": "Answer", "text": "SILVIO STORE à Lomé-Nukafu propose une large sélection de pochettes de luxe et coques originales pour iPhone et Samsung. Commandez en ligne sur silviostore.com avec livraison partout en Afrique de l'Ouest." }
            },
            {
              "@type": "Question",
              "name": "Les accessoires téléphone de SILVIO STORE sont-ils originaux ?",
              "acceptedAnswer": { "@type": "Answer", "text": "Oui, tous les accessoires téléphone vendus sur SILVIO STORE sont authentiques et originaux. Coques, pochettes, bracelets Apple Watch, chargeurs — chaque produit est vérifié avant expédition." }
            },
            {
              "@type": "Question",
              "name": "Peut-on payer en Mobile Money sur SILVIO STORE ?",
              "acceptedAnswer": { "@type": "Answer", "text": "Oui, SILVIO STORE accepte le paiement Mobile Money (MTN, Moov, Orange, Togocel) via FedaPay. Livraison dans toute la sous région Afrique de l'Ouest." }
            },
            {
              "@type": "Question",
              "name": "SILVIO STORE livre-t-il en dehors du Togo ?",
              "acceptedAnswer": { "@type": "Answer", "text": "Oui, SILVIO STORE livre dans toute la sous région : Togo, Bénin, Ghana, Côte d'Ivoire, Sénégal, Burkina Faso, Mali, Niger, Guinée et Nigeria." }
            }
          ]
        })}} />
      </section>
    </>
  );
}
