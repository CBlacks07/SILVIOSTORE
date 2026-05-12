"use client";

import { useState } from "react";
import { ChevronDown, CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { Product, ProductFaq, ProductSpec } from "@/lib/types";

type TabKey = "description" | "delivery" | "faq" | "specs";

export function ProductTabs({ product, faqItems }: { product: Product; faqItems?: ProductFaq[] }) {
  const description = product.long_description || product.description || "";
  const specs: ProductSpec[] = product.specifications ?? [];
  const faq: ProductFaq[] = faqItems ?? product.faq ?? [];

  const tabs: { key: TabKey; label: string; available: boolean }[] = [
    { key: "description", label: "Description", available: !!description },
    { key: "delivery", label: "Livraison & garantie", available: true },
    { key: "faq", label: "Questions fréquentes", available: faq.length > 0 },
    { key: "specs", label: "Caractéristiques", available: specs.length > 0 }
  ];

  const initial = tabs.find((t) => t.available)?.key ?? "delivery";
  const [active, setActive] = useState<TabKey>(initial);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="mt-14">
      <div className="border-b border-brand-100">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.filter((t) => t.available).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={
                "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors " +
                (active === t.key
                  ? "border-accent text-brand-950"
                  : "border-transparent text-brand-600 hover:text-brand-900")
              }
            >
              {t.label}
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

        {active === "delivery" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Truck,
                title: "Livraison sous-région",
                text: "Togo, Bénin, Ghana, Burkina, Côte d'Ivoire, Niger, Sénégal, Mali, Guinée, Nigeria."
              },
              {
                icon: CreditCard,
                title: "Paiement sécurisé",
                text: "Mobile Money (Flooz, T-Money, MTN, Moov) et cartes via FedaPay."
              },
              {
                icon: ShieldCheck,
                title: "Produits garantis",
                text: "Produits authentiques. Garantie applicable selon le constructeur."
              },
              {
                icon: RotateCcw,
                title: "Retour sous 7 jours",
                text: "Si le produit ne correspond pas, contactez-nous pour un retour ou un échange."
              }
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
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="inline-flex items-center gap-3 px-4 py-3 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-sm font-medium text-brand-900">{f.question}</span>
                    <ChevronDown className={"h-4 w-4 text-brand-500 transition-transform " + (open ? "rotate-180" : "")} />
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
