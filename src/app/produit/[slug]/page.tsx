import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Truck, ShieldCheck, MessageCircle, CheckCircle2, Tag, Hash, PackageCheck } from "lucide-react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { StockUrgency } from "@/components/marketing/StockUrgency";
import { RecentlyViewedTracker, RecentlyViewedSection } from "@/components/product/RecentlyViewed";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductStickyBar } from "@/components/product/ProductStickyBar";
import { QuickAddButton } from "@/components/product/QuickAddButton";
import { AddBundleButton } from "@/components/product/AddBundleButton";
import { ReviewForm } from "@/components/product/ReviewForm";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  getFrequentlyBoughtTogether,
  getProductBySlug,
  getProductReviews,
  getProductSocialProof,
  getRelatedProducts
} from "@/lib/queries";
import { getSetting } from "@/lib/settings";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://silviostore.vercel.app";
  const image = product.images?.[0];
  const imageUrl = image
    ? image.startsWith("http") ? image : `${siteUrl}${image}`
    : undefined;

  const description = product.description
    || `Acheter ${product.name} sur SILVIO STORE. Accessoires premium livrés dans la sous région. Paiement Mobile Money.`;

  return {
    title: `${product.name} | SILVIO STORE`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `${siteUrl}/produit/${product.slug}`,
      siteName: "SILVIO STORE",
      images: imageUrl ? [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: product.name,
      }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

function buildWhatsappUrl(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message);
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, frequentlyBought, site, socialProof, reviews, user, marketing] = await Promise.all([
    getRelatedProducts(product, 4),
    getFrequentlyBoughtTogether(product.id, 3),
    getSetting("site"),
    getProductSocialProof(product.id),
    getProductReviews(product.id, 6),
    getCurrentUser(),
    getSetting("marketing"),
  ]);

  const canReview = user
    ? (await sql<{ ok: boolean }[]>`
        select exists(
          select 1
          from order_items oi
          join orders o on o.id = oi.order_id
          where oi.product_id = ${product.id}
            and o.user_id = ${user.id}
            and o.status in ('paid','preparing','shipped','delivered')
        ) as ok
      `)[0]?.ok ?? false
    : false;

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : null;

  const waUrl = buildWhatsappUrl(
    site.phone,
    `Bonjour SILVIO STORE, je suis intéressé par : ${product.name} (${formatPrice(product.price)}).`
  );

  const keyBenefits = [
    "Compatibilité large avec les modèles du marché",
    "Qualité testée pour un usage quotidien fiable",
    "Livraison rapide et support WhatsApp réactif"
  ];

  const quickFaq =
    product.faq?.slice(0, 3) ??
    [
      {
        question: "Cet accessoire est-il compatible avec mon appareil ?",
        answer: "Écrivez-nous sur WhatsApp avec votre modèle exact, nous confirmons immédiatement."
      },
      {
        question: "Quel est le délai de livraison ?",
        answer: "La livraison est généralement effectuée en 3 à 5 jours selon la zone."
      },
      {
        question: "Puis-je retourner le produit ?",
        answer: "Oui, selon nos conditions de retour, si le produit est dans son état d'origine."
      }
    ];

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description || product.long_description || undefined,
    sku: product.sku || undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: product.images ?? [],
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: site.currency || "XOF",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-page py-6 md:py-10 pb-32 lg:pb-12">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-brand-500">
          <Link href="/" className="hover:text-brand-900 transition-colors font-medium">Accueil</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/catalogue" className="hover:text-brand-900 transition-colors font-medium">Catalogue</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-brand-800 font-semibold truncate">{product.name}</span>
        </nav>

        {/* Main Product Grid */}
        <div className="product-layout">
          {/* Gallery */}
          <div className="order-2 lg:order-1">
            <ProductGallery images={product.images ?? []} alt={product.name} discount={discount} />
          </div>

          {/* Product Info */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Brand */}
            {product.brand && (
              <span className="inline-block text-xs uppercase tracking-widest text-brand-500 font-black bg-brand-50 px-4 py-2 rounded-full border border-brand-200">
                {product.brand}
              </span>
            )}

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-brand-950 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating & Sales */}
            <div className="flex flex-wrap items-center gap-4">
              {socialProof.avgRating ? (
                <div className="inline-flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                  <span className="text-amber-500 text-lg font-bold">★ {socialProof.avgRating.toFixed(1)}</span>
                  <span className="text-sm text-brand-600">({socialProof.reviewCount} avis)</span>
                </div>
              ) : (
                <span className="text-sm text-brand-500 bg-brand-50 px-4 py-2 rounded-full">Aucun avis</span>
              )}
              {socialProof.soldCount > 0 && (
                <span className="text-sm text-brand-600 bg-brand-100 px-4 py-2 rounded-full font-semibold">
                  {socialProof.soldCount} ventes
                </span>
              )}
            </div>

            {/* Price */}
            <div>
              <div className="flex flex-wrap items-baseline gap-4 mb-3">
                <span className="font-display font-black tracking-tight" style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)", color: "#1a1008", lineHeight: 1 }}>
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-brand-400 line-through">{formatPrice(product.compare_at_price)}</span>
                    {discount && (
                      <span style={{ background: "#d97706", color: "#fff", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px" }}>-{discount}%</span>
                    )}
                  </div>
                )}
              </div>
              {product.stock > 0 ? (
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-green-700">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  En stock
                </div>
              ) : (
                <span className="text-sm font-semibold text-red-600">Rupture de stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-brand-700 border-l-2 pl-4" style={{ borderColor: "rgba(217,119,6,0.40)" }}>{product.description}</p>
            )}

            {/* Stock urgency */}
            {marketing.stock_urgency.enabled && product.stock > 0 && product.stock <= marketing.stock_urgency.threshold && (
              <StockUrgency stock={product.stock} threshold={marketing.stock_urgency.threshold} />
            )}

            {/* Add to Cart */}
            <div className="py-2">
              <AddToCartForm product={product} />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Livraison", sub: "Sous-région" },
                { icon: ShieldCheck, label: "Paiement", sub: "Sécurisé" },
                { icon: MessageCircle, label: "Support", sub: "WhatsApp" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 rounded-xl bg-brand-50/60 px-3 py-3 text-center"
                >
                  <Icon className="h-6 w-6 md:h-7 md:w-7 text-accent" />
                  <span className="text-xs md:text-sm font-bold text-brand-900 leading-tight">{label}</span>
                  <span className="text-[10px] md:text-xs text-brand-500 leading-tight">{sub}</span>
                </div>
              ))}
            </div>

            {/* Product Info Cards */}
            <div className="rounded-xl border border-brand-100 bg-white p-4">
              <h2 className="text-base md:text-lg font-black text-brand-950 mb-5 flex items-center gap-2">
                <PackageCheck className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                Informations produit
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Tag, label: "Marque", value: product.brand || "SILVIO STORE" },
                  { icon: Hash, label: "SKU", value: product.sku || "N/A" },
                  { icon: PackageCheck, label: "État", value: product.stock > 0 ? "Disponible" : "Rupture" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-brand-50/50 border border-brand-100">
                    <Icon className="h-5 w-5 text-brand-400" />
                    <span className="text-[10px] uppercase tracking-wider text-brand-400 font-bold">{label}</span>
                    <span className="text-xs md:text-sm font-bold text-brand-900 truncate max-w-full">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-xl border border-green-100 bg-green-50/40 p-4">
              <h2 className="text-base md:text-lg font-black text-brand-950 mb-5 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                Pourquoi cet accessoire ?
              </h2>
              <ul className="space-y-3">
                {keyBenefits.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <span className="text-sm md:text-base text-brand-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp */}
            {waUrl && (
              <div className="flex justify-center mt-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa-pill"
                >
                  <svg aria-hidden viewBox="0 0 24 24" style={{ width: "18px", height: "18px", fill: "currentColor", flexShrink: 0 }}>
                    <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.67 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.15-3.41-8.43zM12.06 21.6h-.01a9.72 9.72 0 0 1-4.96-1.36l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.7 9.7 0 0 1-1.48-5.14c0-5.36 4.36-9.73 9.73-9.73a9.67 9.67 0 0 1 6.88 2.85 9.65 9.65 0 0 1 2.85 6.88c0 5.37-4.36 9.73-9.72 9.73zm5.34-7.29c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.15-.17.2-.34.22-.64.07-.29-.15-1.24-.46-2.37-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.03-.51-.07-.15-.66-1.58-.9-2.17-.24-.58-.49-.5-.66-.5l-.56-.01c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43 0 1.43 1.05 2.82 1.2 3.01.15.2 2.07 3.17 5.01 4.44.7.3 1.25.49 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.74-.71 1.98-1.4.24-.69.24-1.27.17-1.4-.07-.12-.27-.2-.56-.34z" />
                  </svg>
                  Discuter sur WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-page">
        <ProductTabs product={product} faqItems={quickFaq} />

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-brand-100 bg-white p-5">
            <h2 className="font-display text-xl md:text-2xl font-black text-brand-950 mb-2">Avis clients</h2>
            <p className="text-sm text-brand-600 mb-6">
              {socialProof.avgRating
                ? `Note moyenne: ${socialProof.avgRating.toFixed(1)} / 5`
                : "Soyez le premier à noter cet accessoire."}
            </p>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm text-brand-600 bg-brand-50 p-6 rounded-xl text-center">Aucun avis publié pour le moment.</p>
              ) : (
                reviews.map((r) => (
                  <article key={r.id} className="rounded-xl border border-brand-100 p-4 bg-gradient-to-br from-white to-brand-50/30 hover:shadow-md transition-shadow">
                    <p className="text-sm font-semibold text-brand-900 flex items-center gap-2">
                      <span className="text-amber-500">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                      <span className="text-brand-700">{r.author_name}</span>
                    </p>
                    {r.comment && <p className="mt-2 text-sm text-brand-700 leading-relaxed">{r.comment}</p>}
                    <p className="mt-2 text-xs text-brand-500">
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                      {r.is_verified_purchase && <span className="ml-2 text-green-600 font-medium">• achat vérifié</span>}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-brand-100 bg-white p-5">
            <h2 className="font-display text-xl md:text-2xl font-black text-brand-950 mb-2">Donner votre avis</h2>
            <p className="text-sm text-brand-600 mb-6">Votre retour aide les autres clients à mieux choisir.</p>
            <div>
              <ReviewForm productId={product.id} canReview={canReview} isLoggedIn={!!user} />
            </div>
          </div>
        </section>

        {frequentlyBought.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl md:text-3xl font-black text-brand-950">Souvent achetés ensemble</h2>
              <AddBundleButton products={frequentlyBought} />
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {frequentlyBought.map((p) => (
                <div key={p.id} className="rounded-xl border border-brand-100 bg-white p-4">
                  <Link href={"/produit/" + p.slug} className="text-base font-bold text-brand-900 hover:text-accent transition-colors">
                    {p.name}
                  </Link>
                  <p className="mt-2 text-base text-brand-600 font-semibold">{formatPrice(p.price)}</p>
                  <div className="mt-4">
                    <QuickAddButton product={p} className="btn-outline h-11 px-5 text-sm w-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-20 pb-12">
            <h2 className="mb-8 font-display text-2xl md:text-3xl font-black text-brand-950 tracking-tight">Vous pourriez aussi aimer</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 md:gap-7">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <RecentlyViewedTracker product={{ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.images?.[0] ?? null }} />
      <div className="container-page">
        <RecentlyViewedSection currentId={product.id} />
      </div>
      <ProductStickyBar product={product} />
    </div>
  );
}
