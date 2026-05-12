import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Truck, ShieldCheck, MessageCircle, CheckCircle2, Tag, Hash, PackageCheck } from "lucide-react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartForm } from "@/components/product/AddToCartForm";
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

  return {
    title: product.name,
    description: product.description || `Acheter ${product.name} sur SILVIO STORE. Qualité premium et livraison rapide.`,
    openGraph: {
      images: product.images?.[0] ? [{ url: product.images[0] }] : []
    }
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

  const [related, frequentlyBought, site, socialProof, reviews, user] = await Promise.all([
    getRelatedProducts(product, 4),
    getFrequentlyBoughtTogether(product.id, 3),
    getSetting("site"),
    getProductSocialProof(product.id),
    getProductReviews(product.id, 6),
    getCurrentUser()
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
    <div className="container-page py-8 pb-24 lg:pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 flex items-center gap-1 text-xs text-brand-500">
        <Link href="/" className="hover:text-brand-900">Accueil</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalogue" className="hover:text-brand-900">Catalogue</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-brand-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[460px,1fr] xl:grid-cols-[500px,1fr]">
        <ProductGallery images={product.images ?? []} alt={product.name} discount={discount} />

        <div>
          {product.brand && <span className="text-xs uppercase tracking-wide text-brand-500">{product.brand}</span>}
          <h1 className="mt-1 font-display text-3xl font-bold text-brand-950">{product.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-950">{formatPrice(product.price)}</span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-base text-brand-400 line-through">{formatPrice(product.compare_at_price)}</span>
            )}
          </div>

          <p className="mt-2 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-700">En stock - disponible</span>
            ) : (
              <span className="text-red-700">Rupture de stock</span>
            )}
          </p>

          <p className="subtitle mt-1 text-sm text-brand-600">
            {socialProof.avgRating ? (
              <span>★ {socialProof.avgRating.toFixed(1)} ({socialProof.reviewCount} avis)</span>
            ) : (
              <span>Aucun avis pour le moment</span>
            )}
            {socialProof.soldCount > 0 && <span className="ml-2">• {socialProof.soldCount} ventes</span>}
          </p>

          {product.description && <p className="mt-6 leading-relaxed text-brand-700">{product.description}</p>}

          <div className="mt-8">
            <AddToCartForm product={product} />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: Truck, label: "Livraison", sub: "sous-région" },
              { icon: ShieldCheck, label: "Paiement", sub: "sécurisé FedaPay" },
              { icon: MessageCircle, label: "Support", sub: "WhatsApp réactif" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-brand-100 bg-brand-50/60 px-2 py-3 text-center">
                <Icon className="h-5 w-5 text-accent" />
                <span className="text-[11px] font-semibold text-brand-800 leading-tight">{label}</span>
                <span className="text-[10px] text-brand-500 leading-tight">{sub}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-brand-100 bg-white p-4">
            <h2 className="text-sm font-semibold text-brand-950 mb-3">Infos clés</h2>
            <div className="grid grid-cols-3 divide-x divide-brand-100">
              {[
                { icon: Tag, label: "Marque", value: product.brand || "SILVIO STORE" },
                { icon: Hash, label: "SKU", value: product.sku || "N/A" },
                { icon: PackageCheck, label: "État", value: product.stock > 0 ? "Disponible" : "Rupture" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-3 py-2 text-center">
                  <Icon className="h-4 w-4 text-brand-400" />
                  <span className="text-[10px] uppercase tracking-wide text-brand-400 font-semibold">{label}</span>
                  <span className="text-xs font-semibold text-brand-800 truncate max-w-full">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-green-100 bg-green-50/40 p-4">
            <h2 className="text-sm font-semibold text-brand-950 mb-3">Pourquoi cet accessoire ?</h2>
            <ul className="space-y-2.5">
              {keyBenefits.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-sm text-brand-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-current shrink-0">
                <path d="M20.52 3.48A11.77 11.77 0 0 0 12.05 0C5.5 0 .18 5.32.18 11.87c0 2.09.55 4.13 1.59 5.93L0 24l6.38-1.67a11.8 11.8 0 0 0 5.67 1.45h.01c6.55 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.15-3.41-8.43zM12.06 21.6h-.01a9.72 9.72 0 0 1-4.96-1.36l-.36-.21-3.79.99 1.01-3.69-.23-.38a9.7 9.7 0 0 1-1.48-5.14c0-5.36 4.36-9.73 9.73-9.73a9.67 9.67 0 0 1 6.88 2.85 9.65 9.65 0 0 1 2.85 6.88c0 5.37-4.36 9.73-9.72 9.73zm5.34-7.29c-.29-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.29-.76.96-.93 1.15-.17.2-.34.22-.64.07-.29-.15-1.24-.46-2.37-1.46-.87-.78-1.46-1.74-1.63-2.03-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.03-.51-.07-.15-.66-1.58-.9-2.17-.24-.58-.49-.5-.66-.5l-.56-.01c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.43 0 1.43 1.05 2.82 1.2 3.01.15.2 2.07 3.17 5.01 4.44.7.3 1.25.49 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.74-.71 1.98-1.4.24-.69.24-1.27.17-1.4-.07-.12-.27-.2-.56-.34z" />
              </svg>
              Discuter sur WhatsApp
            </a>
          )}
        </div>
      </div>

      <ProductTabs product={product} faqItems={quickFaq} />

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-brand-100 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-brand-950">Avis clients</h2>
          <p className="mt-1 text-sm text-brand-600">
            {socialProof.avgRating
              ? `Note moyenne: ${socialProof.avgRating.toFixed(1)} / 5`
              : "Soyez le premier à noter cet accessoire."}
          </p>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-brand-600">Aucun avis publié pour le moment.</p>
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="rounded-lg border border-brand-100 p-3">
                  <p className="text-sm font-medium text-brand-900">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    <span className="ml-2 text-brand-600">{r.author_name}</span>
                  </p>
                  {r.comment && <p className="mt-1 text-sm text-brand-700">{r.comment}</p>}
                  <p className="mt-1 text-xs text-brand-500">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    {r.is_verified_purchase ? " • achat vérifié" : ""}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-brand-100 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-brand-950">Donner votre avis</h2>
          <p className="mt-1 text-sm text-brand-600">Votre retour aide les autres clients à mieux choisir.</p>
          <div className="mt-4">
            <ReviewForm productId={product.id} canReview={canReview} isLoggedIn={!!user} />
          </div>
        </div>
      </section>

      {frequentlyBought.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-brand-950">Souvent achetés ensemble</h2>
            <AddBundleButton products={frequentlyBought} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {frequentlyBought.map((p) => (
              <div key={p.id} className="rounded-xl border border-brand-100 bg-white p-4">
                <Link href={"/produit/" + p.slug} className="text-sm font-medium text-brand-900 hover:text-accent">
                  {p.name}
                </Link>
                <p className="mt-1 text-sm text-brand-600">{formatPrice(p.price)}</p>
                <div className="mt-3">
                  <QuickAddButton product={p} className="btn-outline h-10 px-4 text-sm" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-xl font-bold text-brand-950">Vous pourriez aussi aimer</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <ProductStickyBar product={product} />
    </div>
  );
}

