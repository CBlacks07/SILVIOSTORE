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
              <div key={item.title} className="card card-hover px-4 py-3 flex items-center gap-3">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={"/catalogue?categorie=" + c.slug}
              className="btn-hero-secondary"
            >
              {c.name}
            </Link>
          ))}
        </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 grid-stagger">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
      </Reveal>

      {cta.enabled && (
        <section className="container-page py-16">
          <div className="rounded-2xl bg-brand-950 text-white p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center shadow-xl shadow-brand-900/10">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold">{cta.title}</h3>
              <p className="mt-3 text-brand-200">{cta.text}</p>
            </div>
            {cta.cta_label && cta.cta_link && (
              <div className="flex md:justify-end">
                <Link href={cta.cta_link} className="btn-accent">{cta.cta_label}</Link>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
