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
import { getFeaturedProducts } from "@/lib/queries";
import { getSetting, listActiveBanners, listActiveBrands } from "@/lib/settings";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, categories, hero, cta, topBanners, brands, features, testimonials] = await Promise.all([
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
    getSetting("testimonials")
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

      <Reveal as="section" className="container-page py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mb-2">Catalogue</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-950 tracking-tight">Nos catégories</h2>
          </div>
          <Link href="/catalogue" className="hidden sm:btn-hero-outline">
            Tout voir
          </Link>
        </div>
        <div className="categories-scroll-row">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={"/catalogue?categorie=" + c.slug}
              className="btn-hero-secondary whitespace-nowrap shrink-0 sm:shrink"
            >
              {c.name}
            </Link>
          ))}
        </div>
        <style>{`
          .categories-scroll-row {
            display: flex;
            gap: 0.75rem;
            overflow-x: auto;
            padding: 4px 4px 12px 4px;
            margin: -4px -4px 0 -4px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .categories-scroll-row::-webkit-scrollbar {
            display: none;
          }
          @media (min-width: 768px) {
            .categories-scroll-row {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              overflow-x: visible;
              padding: 0;
              margin: 0;
            }
          }
          @media (min-width: 1024px) {
            .categories-scroll-row {
              grid-template-columns: repeat(6, 1fr);
            }
          }
        `}</style>
      </Reveal>

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
          <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "12px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            className="snap-x snap-mandatory">
            <style>{`.selection-scroll::-webkit-scrollbar{display:none}`}</style>
            {featured.map((p) => (
              <div key={p.id} style={{ flexShrink: 0, width: "clamp(200px, 45vw, 260px)" }} className="snap-start">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </Reveal>

      {brands.length > 0 && (
        <section className="section-band">
          <div className="container-page py-14">
            <div className="text-center mb-14">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-accent mb-3">Marques</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-950 tracking-tight">
                Les grandes marques, à portée de main.
              </h2>
              <p className="mt-3 text-sm text-brand-600">Originaux, compatibles et garantis dans la sous région.</p>
            </div>
            <style>{`
              .brands-row {
                display: flex;
                flex-wrap: nowrap;
                align-items: center;
                justify-content: flex-start;
                gap: 40px;
                overflow-x: auto;
                padding-bottom: 8px;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
              }
              .brands-row::-webkit-scrollbar { display: none; }
              @media (min-width: 768px) {
                .brands-row {
                  flex-wrap: wrap;
                  justify-content: center;
                  gap: clamp(48px, 6vw, 96px);
                  overflow-x: visible;
                  padding-bottom: 0;
                }
              }
            `}</style>
            <div className="brands-row">
              {brands.map((b) => (
                <div key={b.id} className="flex-shrink-0 snap-center">
                  <BrandLogo name={b.name} logo_url={b.logo_url} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <WhySilvioStore />

      <Testimonials data={testimonials} />

      {/* CTA + SEO fusionnés */}
      <section className="container-page py-16">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a1008 0%, #2c1c06 60%, #1a1008 100%)", boxShadow: "0 20px 60px rgba(26,16,8,0.35)" }}
        >
          {/* Gold glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 5% 30%, rgba(217,119,6,0.18) 0%, transparent 55%), radial-gradient(ellipse at 95% 70%, rgba(217,119,6,0.10) 0%, transparent 55%)" }} />

          {/* Top — CTA */}
          {cta.enabled && (
            <div className="relative px-8 md:px-14 pt-10 md:pt-14 pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-[0.28em] mb-2" style={{ color: "#d97706" }}>Notre engagement</p>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white">{cta.title}</h3>
                <p className="mt-2 text-sm leading-relaxed max-w-xl" style={{ color: "rgba(253,230,138,0.85)" }}>{cta.text}</p>
              </div>
              {cta.cta_label && cta.cta_link && (
                <Link href={cta.cta_link} className="btn-accent shrink-0 self-start sm:self-auto">{cta.cta_label}</Link>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="mx-8 md:mx-14" style={{ height: "1px", background: "rgba(217,119,6,0.20)" }} />

          {/* Bottom — SEO 3 colonnes */}
          <div className="relative px-8 md:px-14 py-10 grid md:grid-cols-3 gap-8">
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
