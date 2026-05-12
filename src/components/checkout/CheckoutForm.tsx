"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Check, X, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import type { ShippingSettings } from "@/lib/types";

type Form = {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  district: string;
  details: string;
};

type PromoState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; code: string; discount: number }
  | { status: "invalid"; error: string };

type InitialUser = {
  fullName: string;
  phone: string;
  email: string;
} | null;

type InitialAddress = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  district: string;
  details: string;
} | null;

const COUNTRY_PHONE_EXAMPLE: Record<string, string> = {
  Togo: "+228 90 00 00 00",
  "Bénin": "+229 90 00 00 00",
  Benin: "+229 90 00 00 00",
  Ghana: "+233 20 000 0000",
  "Burkina Faso": "+226 70 00 00 00",
  "Côte d'Ivoire": "+225 07 00 00 00 00",
  "Cote d'Ivoire": "+225 07 00 00 00 00",
  Niger: "+227 90 00 00 00",
  "Sénégal": "+221 77 000 00 00",
  Senegal: "+221 77 000 00 00",
  Mali: "+223 70 00 00 00",
  "Guinée": "+224 620 00 00 00",
  Guinee: "+224 620 00 00 00",
  Nigeria: "+234 801 234 5678"
};

const FEDAPAY_SANDBOX_SUCCESS_NUMBERS = new Set(["64000001", "66000001"]);

function isPhoneLikelyValid(value: string, isFedaPaySandbox: boolean): boolean {
  const compact = value.trim().replace(/[^\d+]/g, "");
  if (!compact) return false;

  const digits = compact.replace(/\D/g, "");
  if (isFedaPaySandbox && FEDAPAY_SANDBOX_SUCCESS_NUMBERS.has(digits)) return true;

  if (compact.startsWith("+")) return /^\+\d{8,15}$/.test(compact);
  return /^\d{8,12}$/.test(digits);
}

function phonePlaceholder(country: string, isFedaPaySandbox: boolean): string {
  if (isFedaPaySandbox) return "64000001 ou 66000001";
  return COUNTRY_PHONE_EXAMPLE[country] || "+228 90 00 00 00";
}

function etaFor(cost: number): string {
  if (cost <= 2000) return "1 à 2 jours";
  if (cost <= 5500) return "3 à 5 jours";
  return "5 à 10 jours";
}

export function CheckoutForm({
  shipping,
  initialUser,
  initialAddress,
  isFedaPaySandbox
}: {
  shipping: ShippingSettings;
  initialUser: InitialUser;
  initialAddress: InitialAddress;
  isFedaPaySandbox: boolean;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const countries = useMemo(
    () => Object.keys(shipping.fees).sort((a, b) => a.localeCompare(b, "fr")),
    [shipping]
  );

  const defaultCountry = useMemo(() => {
    if (countries.includes("Togo")) return "Togo";
    return countries[0] || "Togo";
  }, [countries]);

  const [form, setForm] = useState<Form>(() => {
    const fullName = initialAddress?.fullName || initialUser?.fullName || "";
    const phone = initialAddress?.phone || initialUser?.phone || "";
    const email = initialUser?.email || "";
    const country =
      initialAddress?.country && countries.includes(initialAddress.country)
        ? initialAddress.country
        : defaultCountry;

    return {
      fullName,
      phone,
      email,
      country,
      city: initialAddress?.city || "",
      district: initialAddress?.district || "",
      details: initialAddress?.details || ""
    };
  });

  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoState>({ status: "idle" });

  const shippingCost = shipping.fees[form.country] ?? shipping.default_fee;
  const eta = etaFor(shippingCost);
  const discount = promo.status === "valid" ? promo.discount : 0;
  const savingsPct = subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (items.length === 0) router.replace("/catalogue");
  }, [items.length, router]);

  useEffect(() => {
    if (promo.status === "valid" && subtotal === 0) setPromo({ status: "idle" });
  }, [subtotal, promo.status]);

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "phone") setPhoneError(null);
  }

  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setPromo({ status: "checking" });
    try {
      const res = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPromo({ status: "invalid", error: data.error || "Code invalide" });
        return;
      }
      setPromo({ status: "valid", code: data.code, discount: data.discount });
    } catch {
      setPromo({ status: "invalid", error: "Erreur réseau" });
    }
  }

  function clearPromo() {
    setPromo({ status: "idle" });
    setPromoInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isPhoneLikelyValid(form.phone, isFedaPaySandbox)) {
      setPhoneError(
        isFedaPaySandbox
          ? "Mode test FedaPay: utilisez 64000001 ou 66000001 avec Momo Test."
          : "Numéro invalide. Utilisez un format local (8-12 chiffres) ou international (+228...)."
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form,
          items,
          promoCode: promo.status === "valid" ? promo.code : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création de la commande");
      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (!mounted || items.length === 0) return null;

  return (
    <div className="container-page py-10">
      <Link href="/catalogue" className="mb-6 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-900">
        <ArrowLeft className="h-4 w-4" />
        Continuer mes achats
      </Link>

      <h1 className="font-display text-3xl font-bold text-brand-950">Paiement</h1>
      <p className="subtitle mt-1 text-sm text-brand-600">Finalisez vos informations de livraison avant la validation FedaPay.</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <div className="inline-flex rounded-lg border border-brand-200 bg-white px-3 py-2 text-brand-700">1. Panier validé</div>
        <div className="inline-flex rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 font-medium text-accent-dark">2. Livraison et contact</div>
        <div className="inline-flex rounded-lg border border-brand-200 bg-white px-3 py-2 text-brand-700">3. Paiement FedaPay</div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-[1fr,400px]">
        <div className="space-y-8">
          <section className="card p-6">
            <h2 className="mb-4 font-semibold text-brand-950">Vos informations</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-brand-800">Nom complet</label>
                <input required className="input" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Numéro (Mobile Money)</label>
                <input
                  required
                  type="tel"
                  className={"input " + (phoneError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "")}
                  placeholder={phonePlaceholder(form.country, isFedaPaySandbox)}
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  onBlur={() => {
                    if (form.phone && !isPhoneLikelyValid(form.phone, isFedaPaySandbox)) {
                      setPhoneError(
                        isFedaPaySandbox
                          ? "Mode test FedaPay: utilisez 64000001 ou 66000001 avec Momo Test."
                          : "Numéro invalide. Utilisez un format local (8-12 chiffres) ou international (+228...)."
                      );
                    }
                  }}
                />
                {phoneError ? (
                  <p className="mt-1 text-xs text-red-700">{phoneError}</p>
                ) : (
                  <p className="mt-1 text-xs text-brand-500">
                    {isFedaPaySandbox
                      ? "Sandbox: choisissez Momo Test dans la popup puis utilisez 64000001 ou 66000001."
                      : "Entrez le numéro qui recevra la demande Mobile Money."}
                  </p>
                )}
                {isFedaPaySandbox && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button type="button" className="btn-outline" onClick={() => update("phone", "64000001")}>
                      Utiliser 64000001
                    </button>
                    <button type="button" className="btn-outline" onClick={() => update("phone", "66000001")}>
                      Utiliser 66000001
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">E-mail (optionnel)</label>
                <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="mb-4 font-semibold text-brand-950">Adresse de livraison</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Pays</label>
                <select required className="input" value={form.country} onChange={(e) => update("country", e.target.value)}>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Ville</label>
                <input required className="input" value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-800">Quartier (optionnel)</label>
                <input className="input" value={form.district} onChange={(e) => update("district", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-brand-800">Détails (rue, repère, instructions)</label>
                <textarea required rows={3} className="input" value={form.details} onChange={(e) => update("details", e.target.value)} />
              </div>
            </div>
            <p className="mt-3 text-xs text-brand-500">Livraison estimée: {eta} ({formatPrice(shippingCost)}).</p>
          </section>

          <section className="card p-6">
            <h2 className="mb-1 font-semibold text-brand-950">Mode de paiement</h2>
            <p className="text-sm text-brand-600">Paiement sécurisé via FedaPay: Mobile Money et cartes bancaires.</p>
          </section>

          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>

        <aside className="self-start space-y-4 lg:sticky lg:top-24">
          <div className="card p-6">
            <h2 className="mb-4 font-semibold text-brand-950">Récapitulatif</h2>
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.productId + (i.variantLabel || "")} className="flex gap-3 text-sm">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-brand-50">
                    {i.image && <Image src={i.image} alt={i.name} width={56} height={56} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-brand-950">{i.name}</p>
                    <p className="text-xs text-brand-500">Qté {i.quantity}</p>
                  </div>
                  <span className="text-brand-900">{formatPrice(i.unitPrice * i.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-brand-100 pt-4">
              <label className="mb-1 block text-sm font-medium text-brand-800">Code promo</label>
              {promo.status === "valid" ? (
                <div className="flex items-center justify-between rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-emerald-800">
                    <Check className="h-4 w-4" />
                    {promo.code} appliqué
                  </span>
                  <button type="button" onClick={clearPromo} className="text-emerald-900 hover:text-emerald-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="SILVIO10"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyPromo();
                      }
                    }}
                    disabled={promo.status === "checking"}
                  />
                  <button type="button" onClick={applyPromo} disabled={promo.status === "checking" || !promoInput.trim()} className="btn-outline">
                    {promo.status === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Appliquer"}
                  </button>
                </div>
              )}
              {promo.status === "invalid" && <p className="mt-1 text-xs text-red-700">{promo.error}</p>}
            </div>

            <div className="mt-5 space-y-2 border-t border-brand-100 pt-4 text-sm">
              <div className="flex justify-between"><span className="text-brand-600">Sous-total</span><span className="text-brand-900">{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-brand-600">Remise</span><span className="text-emerald-700">-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-brand-600">Livraison</span><span className="text-brand-900">{formatPrice(shippingCost)}</span></div>
              <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-semibold"><span className="text-brand-950">Total</span><span className="text-brand-950">{formatPrice(total)}</span></div>
              {discount > 0 && (
                <p className="text-xs text-emerald-700">
                  Vous économisez {formatPrice(discount)} ({savingsPct}%).
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-center">
              <button type="submit" disabled={submitting} className="btn-accent">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirection...</> : "Payer " + formatPrice(total)}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px]">
              <div className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-brand-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Paiement sécurisé
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-brand-700">
                <Truck className="h-3.5 w-3.5" />
                Livraison {eta}
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-brand-700">
                <MessageCircle className="h-3.5 w-3.5" />
                Support WhatsApp
              </div>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
