"use client";

import { useState } from "react";
import { ChevronDown, CreditCard, RotateCcw, ShieldCheck, Truck, Star } from "lucide-react";
import type { Product, ProductFaq, ProductSpec, ProductReview } from "@/lib/types";

type TabKey = "description" | "delivery" | "faq" | "specs" | "reviews";

export function ProductTabs({
  product,
  faqItems,
  reviews = [],
}: {
  product: Product;
  faqItems?: ProductFaq[];
  reviews?: ProductReview[];
}) {
  const description = product.long_description || product.description || "";
  const specs: ProductSpec[] = product.specifications ?? [];
  const faq: ProductFaq[] = faqItems ?? product.faq ?? [];

  const tabs: { key: TabKey; label: string; available: boolean; count?: number }[] = [
    { key: "description", label: "Description",         available: !!description },
    { key: "reviews",     label: "Avis clients",        available: true, count: reviews.length },
    { key: "delivery",   label: "Livraison & garantie", available: true },
    { key: "faq",        label: "Questions fréquentes", available: faq.length > 0 },
    // Specs déplacées dans le bloc "Informations produit" sur la page produit
  ];

  const initial = tabs.find((t) => t.available)?.key ?? "delivery";
  const [active, setActive] = useState<TabKey>(initial);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;

  return (
    <div className="mt-14">
      <div className="border-b border-brand-100">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.filter((t) => t.available).map((t) => (
            <button key={t.key} type="button" onClick={() => setActive(t.key)}
              className={"whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 " +
                (active === t.key ? "border-accent text-brand-950" : "border-transparent text-brand-600 hover:text-brand-900")}>
              {t.label}
              {t.count !== undefined && (
                <span className={"text-[10px] font-bold rounded-full px-1.5 py-0.5 " +
                  (active === t.key ? "bg-accent text-white" : "bg-brand-100 text-brand-500")}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="py-6">
        {active === "description" && (
          <div className="prose prose-sm max-w-none whitespace-pre-line leading-relaxed text-brand-800">
            {description}
          </div>
        )}

        {active === "reviews" && (
          <div className="space-y-4">
            {/* Résumé note */}
            {avgRating && (
              <div className="flex items-center gap-4 rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-black text-brand-950">{avgRating.toFixed(1)}</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="h-4 w-4" fill={i <= Math.round(avgRating) ? "#d97706" : "none"} color="#d97706" />
                    ))}
                  </div>
                  <p className="text-xs text-brand-500 mt-1">{reviews.length} avis</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-brand-500">{star}</span>
                        <Star className="h-3 w-3 shrink-0 text-amber-400" fill="#fbbf24" />
                        <div className="flex-1 h-1.5 rounded-full bg-brand-100 overflow-hidden">
                          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-5 text-brand-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-brand-500 bg-brand-50 rounded-xl p-6 text-center">
                Aucun avis pour l&apos;instant. Soyez le premier à donner votre avis !
              </p>
            ) : (
              reviews.map((r) => (
                <article key={r.id} className="rounded-xl border border-brand-100 bg-white p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <span className="font-semibold text-sm text-brand-900">{r.author_name}</span>
                    {r.is_verified_purchase && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">achat vérifié</span>
                    )}
                  </div>
                  {r.comment && <p className="text-sm text-brand-700 leading-relaxed">{r.comment}</p>}
                  <p className="mt-2 text-xs text-brand-400">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                </article>
              ))
            )}
          </div>
        )}

        {active === "delivery" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Truck,       title: "Livraison sous-région",  text: "Togo, Bénin, Ghana, Burkina, Côte d'Ivoire, Niger, Sénégal, Mali, Guinée, Nigeria." },
              { icon: CreditCard,  title: "Paiement sécurisé",      text: "Mobile Money (Flooz, T-Money, MTN, Moov) et cartes via FedaPay." },
              { icon: ShieldCheck, title: "Produits garantis",       text: "Produits authentiques. Garantie applicable selon le constructeur." },
              { icon: RotateCcw,   title: "Retour sous 7 jours",    text: "Si le produit ne correspond pas, contactez-nous pour un retour ou un échange." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-lg border border-brand-100 bg-white p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/10 p-2 text-accent">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-950">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-brand-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {active === "faq" && (
          <div className="space-y-2">
            {faq.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="rounded-lg border border-brand-100 bg-white">
                  <button type="button" onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full inline-flex items-center justify-between gap-3 px-4 py-3 text-left" aria-expanded={open}>
                    <span className="text-sm font-medium text-brand-900">{f.question}</span>
                    <ChevronDown className={"h-4 w-4 text-brand-500 shrink-0 transition-transform " + (open ? "rotate-180" : "")} />
                  </button>
                  {open && <div className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed text-brand-700">{f.answer}</div>}
                </div>
              );
            })}
          </div>
        )}

        {active === "specs" && (
          <div className="overflow-hidden rounded-lg border border-brand-100 bg-white">
            <table className="w-full text-sm">
              <tbody>
                {specs.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-brand-50/40" : ""}>
                    <th className="w-1/3 px-4 py-3 text-left align-top font-medium text-brand-700">{s.label}</th>
                    <td className="px-4 py-3 text-brand-900">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
