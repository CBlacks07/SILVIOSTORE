"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type {
  SiteSettings,
  HeaderStripSettings,
  HomeHeroSettings,
  HomeHeroSlide,
  HomeCtaSettings,
  ShippingSettings,
  FeatureSettings,
  FeatureItem,
  SocialSettings,
  FooterLinksSettings,
  FooterLink,
  TestimonialsSettings,
  Testimonial
} from "@/lib/types";

type SettingsKey = "site" | "header_strip" | "home_hero" | "home_cta" | "shipping" | "features" | "social" | "footer_links" | "testimonials";

function useSave<T>(key: SettingsKey) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(value: T) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings/" + key, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setMsg({ ok: true, text: "Enregistré." });
      router.refresh();
    } catch (e: any) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  return { busy, msg, save };
}

function Section(props: {
  title: string;
  description?: string;
  busy: boolean;
  msg: { ok: boolean; text: string } | null;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card space-y-5 p-6">
      <div>
        <h2 className="font-semibold text-brand-950">{props.title}</h2>
        {props.description && <p className="mt-1 text-sm text-brand-600">{props.description}</p>}
      </div>

      {props.children}

      <div className="flex items-center gap-3 border-t border-brand-100 pt-4">
        <button type="button" onClick={props.onSave} className="btn-primary" disabled={props.busy}>
          {props.busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer
            </>
          )}
        </button>

        {props.msg && (
          <span className={"text-sm " + (props.msg.ok ? "text-green-700" : "text-red-700")}>
            {props.msg.text}
          </span>
        )}
      </div>
    </div>
  );
}

export function SiteInfoForm({ initial }: { initial: SiteSettings }) {
  const [v, setV] = useState(initial);
  const { busy, msg, save } = useSave<SiteSettings>("site");

  return (
    <Section title="Informations de la boutique" busy={busy} msg={msg} onSave={() => save(v)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Logo Header (rectangle)" full>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-brand-50/50 p-4 rounded-xl border border-brand-100">
            <div className="w-32 h-16 relative bg-brand-900 rounded-lg overflow-hidden flex items-center justify-center border border-brand-200 shrink-0">
              {v.logo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={v.logo_url} alt="Logo header" className="max-w-full max-h-full object-contain p-2" />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Aucun logo</span>
              )}
            </div>
            <div className="flex-1 w-full">
              <ImageUploader
                value={v.logo_url || ""}
                onChange={(url) => setV({ ...v, logo_url: url })}
                folder="site"
                emptyMinHeight="sm"
              />
              <p className="mt-1.5 text-[11px] text-brand-500">Affiché dans la barre de navigation (header).</p>
            </div>
          </div>
        </Field>

        <Field label="Logo Footer (rondelle)" full>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-brand-50/50 p-4 rounded-xl border border-brand-100">
            <div className="w-16 h-16 relative bg-brand-900 rounded-full overflow-hidden flex items-center justify-center border border-brand-200 shrink-0">
              {v.logo_footer_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={v.logo_footer_url} alt="Logo footer" className="max-w-full max-h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Aucun</span>
              )}
            </div>
            <div className="flex-1 w-full">
              <ImageUploader
                value={v.logo_footer_url || ""}
                onChange={(url) => setV({ ...v, logo_footer_url: url })}
                folder="site"
                emptyMinHeight="sm"
              />
              <p className="mt-1.5 text-[11px] text-brand-500">Affiché dans le footer (format carré ou rond recommandé).</p>
            </div>
          </div>
        </Field>

        <Field label="Nom de la boutique">
          <input className="input" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        </Field>

        <Field label="Devise">
          <input className="input" value={v.currency} onChange={(e) => setV({ ...v, currency: e.target.value })} />
        </Field>

        <Field label="Tagline" full>
          <input className="input" value={v.tagline} onChange={(e) => setV({ ...v, tagline: e.target.value })} />
        </Field>

        <Field label="Description (SEO)" full>
          <textarea className="input min-h-20" value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
        </Field>

        <Field label="Numéro principal">
          <input className="input" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
        </Field>

        <Field label="Numéro secondaire">
          <input className="input" value={v.phone2 ?? ""} onChange={(e) => setV({ ...v, phone2: e.target.value })} />
        </Field>

        <Field label="E-mail">
          <input className="input" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        </Field>

        <Field label="Adresse physique" full>
          <input className="input" value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} />
        </Field>
      </div>
    </Section>
  );
}

export function HeaderStripForm({ initial }: { initial: HeaderStripSettings }) {
  const [v, setV] = useState(initial);
  const { busy, msg, save } = useSave<HeaderStripSettings>("header_strip");

  return (
    <Section
      title="Bandeau en haut du site"
      description="Petite ligne affichée au-dessus du menu."
      busy={busy}
      msg={msg}
      onSave={() => save(v)}
    >
      <Field label="Texte du bandeau">
        <input className="input" value={v.text} onChange={(e) => setV({ ...v, text: e.target.value })} />
      </Field>

      <Toggle label="Afficher le bandeau" value={v.enabled} onChange={(b) => setV({ ...v, enabled: b })} />
    </Section>
  );
}

export function HomeHeroForm({ initial }: { initial: HomeHeroSettings }) {
  const [v, setV] = useState<HomeHeroSettings>({
    ...initial,
    slides: initial.slides || [],
  });
  const { busy, msg, save } = useSave<HomeHeroSettings>("home_hero");

  function addSlide() {
    setV((prev) => ({
      ...prev,
      slides: [
        ...(prev.slides || []),
        {
          image_url: "",
          badge_text: "",
          title: "",
          subtitle: "",
          cta_label: "",
          cta_link: "",
          cta2_label: "",
          cta2_link: ""
        }
      ]
    }));
  }

  function updateSlide(index: number, patch: Partial<HomeHeroSlide>) {
    setV((prev) => ({
      ...prev,
      slides: (prev.slides || []).map((s, i) => (i === index ? { ...s, ...patch } : s))
    }));
  }

  function removeSlide(index: number) {
    setV((prev) => ({
      ...prev,
      slides: (prev.slides || []).filter((_, i) => i !== index)
    }));
  }

  function moveSlide(index: number, dir: -1 | 1) {
    setV((prev) => {
      const arr = [...(prev.slides || [])];
      const target = index + dir;
      if (target < 0 || target >= arr.length) return prev;
      [arr[index], arr[target]] = [arr[target], arr[index]];
      return { ...prev, slides: arr };
    });
  }

  return (
    <Section
      title="Bannière principale (hero)"
      description="Gérez les images et les textes qui défilent en haut de la page d'accueil."
      busy={busy}
      msg={msg}
      onSave={() => save(v)}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-brand-100 pb-4">
          <div>
            <p className="text-sm font-semibold text-brand-900">Slides du carrousel</p>
            <p className="mt-1 text-xs text-brand-500">
              Ajoutez des images avec leurs titres et boutons d'appel à l'action.
            </p>
          </div>
          <button type="button" onClick={addSlide} className="btn-primary py-2 text-xs">
            <Plus className="h-4 w-4" /> Ajouter un slide
          </button>
        </div>

        {(v.slides || []).length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-brand-200 p-10 text-center text-sm text-brand-500">
            Aucun slide défini. Cliquez sur le bouton ci-dessus pour commencer.
          </div>
        ) : (
          <div className="space-y-6">
            {(v.slides || []).map((slide, index) => (
              <div key={index} className="relative rounded-xl border border-brand-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-900 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => moveSlide(index, -1)} disabled={index === 0} className="btn-outline px-2 py-1 text-xs disabled:opacity-40">Monter</button>
                    <button type="button" onClick={() => moveSlide(index, 1)} disabled={index === (v.slides || []).length - 1} className="btn-outline px-2 py-1 text-xs disabled:opacity-40">Descendre</button>
                    <button type="button" onClick={() => removeSlide(index)} className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" /> Supprimer
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Image du slide" full>
                    <ImageUploader value={slide.image_url || ""} onChange={(url) => updateSlide(index, { image_url: url })} folder="site" emptyMinHeight="sm" />
                  </Field>
                  <Field label="Petit badge (optionnel)">
                    <input className="input" placeholder="Ex: Nouveauté" value={slide.badge_text || ""} onChange={(e) => updateSlide(index, { badge_text: e.target.value })} />
                  </Field>
                  <Field label="Titre principal" full>
                    <input className="input font-semibold" value={slide.title || ""} onChange={(e) => updateSlide(index, { title: e.target.value })} />
                  </Field>
                  <Field label="Description / Sous-titre" full>
                    <textarea className="input min-h-20" value={slide.subtitle || ""} onChange={(e) => updateSlide(index, { subtitle: e.target.value })} />
                  </Field>
                  <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                    <Field label="Bouton - Texte">
                      <input className="input" placeholder="Par défaut: En savoir plus" value={slide.cta_label || ""} onChange={(e) => updateSlide(index, { cta_label: e.target.value })} />
                    </Field>
                    <Field label="Bouton - Lien">
                      <input className="input" placeholder="Par défaut: /catalogue" value={slide.cta_link || ""} onChange={(e) => updateSlide(index, { cta_link: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 rounded-lg bg-brand-50 p-4">
          <Toggle label="Activer l'affichage du Hero sur le site" value={v.enabled} onChange={(b) => setV({ ...v, enabled: b })} />
        </div>
      </div>
    </Section>
  );
}


export function HomeCtaForm({ initial }: { initial: HomeCtaSettings }) {
  const [v, setV] = useState(initial);
  const { busy, msg, save } = useSave<HomeCtaSettings>("home_cta");

  return (
    <Section title="Bloc d'appel à l'action (bas de home)" busy={busy} msg={msg} onSave={() => save(v)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titre" full>
          <textarea className="input min-h-20" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </Field>

        <Field label="Texte" full>
          <textarea className="input min-h-20" value={v.text} onChange={(e) => setV({ ...v, text: e.target.value })} />
        </Field>

        <Field label="Bouton - texte">
          <input className="input" value={v.cta_label} onChange={(e) => setV({ ...v, cta_label: e.target.value })} />
        </Field>

        <Field label="Bouton - lien">
          <input className="input" value={v.cta_link} onChange={(e) => setV({ ...v, cta_link: e.target.value })} />
        </Field>
      </div>

      <Toggle label="Afficher ce bloc" value={v.enabled} onChange={(b) => setV({ ...v, enabled: b })} />
    </Section>
  );
}

export function ShippingForm({ initial }: { initial: ShippingSettings }) {
  const [v, setV] = useState(initial);
  const [newCountry, setNewCountry] = useState("");
  const { busy, msg, save } = useSave<ShippingSettings>("shipping");

  function updateFee(country: string, fee: number) {
    setV({ ...v, fees: { ...v.fees, [country]: fee } });
  }

  function removeCountry(country: string) {
    const next = { ...v.fees };
    delete next[country];
    setV({ ...v, fees: next });
  }

  function addCountry() {
    const c = newCountry.trim();
    if (!c || v.fees[c] !== undefined) return;
    setV({ ...v, fees: { ...v.fees, [c]: v.default_fee } });
    setNewCountry("");
  }

  return (
    <Section
      title="Frais de livraison (XOF)"
      description="Tarif par pays. Le tarif par défaut s'applique aux pays non listés."
      busy={busy}
      msg={msg}
      onSave={() => save(v)}
    >
      <Field label="Tarif par défaut">
        <input
          type="number"
          className="input max-w-xs"
          value={v.default_fee}
          onChange={(e) => setV({ ...v, default_fee: Number(e.target.value) || 0 })}
        />
      </Field>

      <div className="overflow-hidden rounded-lg border border-brand-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-50/60 text-left text-brand-600">
              <th className="px-3 py-2">Pays</th>
              <th className="px-3 py-2">Tarif (XOF)</th>
              <th className="w-12 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(v.fees).map(([country, fee]) => (
              <tr key={country} className="border-t border-brand-100">
                <td className="px-3 py-2 text-brand-900">{country}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className="input max-w-[160px]"
                    value={fee}
                    onChange={(e) => updateFee(country, Number(e.target.value) || 0)}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => removeCountry(country)}>
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-end gap-3">
        <Field label="Ajouter un pays">
          <input
            className="input"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            placeholder="Ex: Cap-Vert"
          />
        </Field>
        <button type="button" className="btn-outline" onClick={addCountry}>
          Ajouter
        </button>
      </div>
    </Section>
  );
}

export function FeaturesForm({ initial }: { initial: FeatureSettings }) {
  const [v, setV] = useState<FeatureSettings>({
    ...initial,
    items: initial.items || [],
  });
  const { busy, msg, save } = useSave<FeatureSettings>("features");

  const icons = ["Truck", "ShieldCheck", "CreditCard", "Headset", "Clock", "Package", "MapPin", "Star"];

  function addItem() {
    setV((prev) => ({
      ...prev,
      items: [...(prev.items || []), { icon: "Package", title: "", text: "" }]
    }));
  }

  function updateItem(index: number, patch: Partial<FeatureItem>) {
    setV((prev) => ({
      ...prev,
      items: (prev.items || []).map((s, i) => (i === index ? { ...s, ...patch } : s))
    }));
  }

  function removeItem(index: number) {
    setV((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  }

  return (
    <Section
      title="Avantages (features)"
      description="Icônes et textes affichés sous la bannière principale."
      busy={busy}
      msg={msg}
      onSave={() => save(v)}
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(v.items || []).map((item, index) => (
            <div key={index} className="relative rounded-xl border border-brand-200 bg-white p-4 shadow-sm">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="absolute right-2 top-2 text-brand-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-3">
                <Field label="Icône">
                  <select
                    className="input py-1 text-sm"
                    value={item.icon}
                    onChange={(e) => updateItem(index, { icon: e.target.value })}
                  >
                    {icons.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Titre">
                  <input
                    className="input py-1 text-sm font-semibold"
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                  />
                </Field>
                <Field label="Texte">
                  <input
                    className="input py-1 text-sm"
                    value={item.text}
                    onChange={(e) => updateItem(index, { text: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 p-4 text-brand-500 hover:border-brand-300 hover:bg-brand-50"
          >
            <Plus className="h-6 w-6" />
            <span className="mt-2 text-xs font-medium">Ajouter un avantage</span>
          </button>
        </div>

        <Toggle label="Afficher ces avantages" value={v.enabled} onChange={(b) => setV({ ...v, enabled: b })} />
      </div>
    </Section>
  );
}

export function SocialForm({ initial }: { initial: SocialSettings }) {
  const [v, setV] = useState(initial);
  const { busy, msg, save } = useSave<SocialSettings>("social");

  return (
    <Section title="Réseaux sociaux" busy={busy} msg={msg} onSave={() => save(v)}>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Facebook">
          <input className="input" placeholder="https://facebook.com/..." value={v.facebook} onChange={(e) => setV({ ...v, facebook: e.target.value })} />
        </Field>
        <Field label="Instagram">
          <input className="input" placeholder="https://instagram.com/..." value={v.instagram} onChange={(e) => setV({ ...v, instagram: e.target.value })} />
        </Field>
        <Field label="Twitter / X">
          <input className="input" placeholder="https://twitter.com/..." value={v.twitter} onChange={(e) => setV({ ...v, twitter: e.target.value })} />
        </Field>
        <Field label="TikTok">
          <input className="input" placeholder="https://tiktok.com/@..." value={v.tiktok} onChange={(e) => setV({ ...v, tiktok: e.target.value })} />
        </Field>
        <Field label="WhatsApp (lien ou numéro)">
          <input className="input" placeholder="https://wa.me/..." value={v.whatsapp} onChange={(e) => setV({ ...v, whatsapp: e.target.value })} />
        </Field>
      </div>
    </Section>
  );
}

export function FooterLinksForm({ initial }: { initial: FooterLinksSettings }) {
  const [v, setV] = useState<FooterLinksSettings>({
    ...initial,
    links: initial.links || [],
  });
  const { busy, msg, save } = useSave<FooterLinksSettings>("footer_links");

  function addLink() {
    setV((prev) => ({
      ...prev,
      links: [...(prev.links || []), { label: "", url: "" }]
    }));
  }

  function updateLink(index: number, patch: Partial<FooterLink>) {
    setV((prev) => ({
      ...prev,
      links: (prev.links || []).map((l, i) => (i === index ? { ...l, ...patch } : l))
    }));
  }

  function removeLink(index: number) {
    setV((prev) => ({
      ...prev,
      links: (prev.links || []).filter((_, i) => i !== index)
    }));
  }

  return (
    <Section
      title="Liens du pied de page"
      description="Gérez les liens d'information affichés en bas du site."
      busy={busy}
      msg={msg}
      onSave={() => save(v)}
    >
      <div className="space-y-4">
        {(v.links || []).map((link, index) => (
          <div key={index} className="flex items-end gap-3 rounded-lg border border-brand-100 p-3">
            <div className="grid flex-1 gap-3 md:grid-cols-2">
              <Field label="Libellé">
                <input className="input text-sm" placeholder="Ex: Livraison" value={link.label} onChange={(e) => updateLink(index, { label: e.target.value })} />
              </Field>
              <Field label="Lien (URL)">
                <input className="input text-sm" placeholder="Ex: /livraison" value={link.url} onChange={(e) => updateLink(index, { url: e.target.value })} />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="mb-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button type="button" onClick={addLink} className="btn-outline flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ajouter un lien
        </button>
      </div>
    </Section>
  );
}

function Field({ label, full = false, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={"block " + (full ? "md:col-span-2" : "") }>
      <span className="mb-1 block text-sm font-medium text-brand-800">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-brand-800">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

export function TestimonialsForm({ initial }: { initial: TestimonialsSettings }) {
  const [v, setV] = useState<TestimonialsSettings>({
    ...initial,
    items: initial.items || []
  });
  const { busy, msg, save } = useSave<TestimonialsSettings>("testimonials");

  function addItem() {
    setV((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", location: "", rating: 5, text: "" }]
    }));
  }

  function updateItem(i: number, patch: Partial<Testimonial>) {
    setV((prev) => ({
      ...prev,
      items: prev.items.map((item, j) => j === i ? { ...item, ...patch } : item)
    }));
  }

  function removeItem(i: number) {
    setV((prev) => ({ ...prev, items: prev.items.filter((_, j) => j !== i) }));
  }

  return (
    <Section
      title="Témoignages clients"
      description="Avis affichés sur la page d'accueil."
      busy={busy}
      msg={msg}
      onSave={() => save(v)}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Titre de la section" full>
          <input className="input" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </Field>
        <Field label="Sous-titre" full>
          <input className="input" value={v.subtitle} onChange={(e) => setV({ ...v, subtitle: e.target.value })} />
        </Field>
      </div>

      <div className="space-y-4 mt-2">
        {v.items.map((item, i) => (
          <div key={i} className="rounded-xl border border-brand-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-brand-900">Avis {i + 1}</p>
              <button type="button" onClick={() => removeItem(i)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50">
                <X className="h-3.5 w-3.5" /> Retirer
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-brand-700 mb-1">Nom</label>
                <input className="input" placeholder="Ex : Koffi A." value={item.name} onChange={(e) => updateItem(i, { name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-700 mb-1">Ville, Pays</label>
                <input className="input" placeholder="Ex : Lomé, Togo" value={item.location} onChange={(e) => updateItem(i, { location: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-700 mb-1">Note (1-5)</label>
                <select className="input" value={item.rating} onChange={(e) => updateItem(i, { rating: Number(e.target.value) })}>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} étoile{n > 1 ? "s" : ""}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">Témoignage</label>
              <textarea rows={3} className="input" placeholder="Le texte de l'avis client..." value={item.text} onChange={(e) => updateItem(i, { text: e.target.value })} />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 p-4 text-sm text-brand-500 hover:border-brand-300 hover:bg-brand-50"
        >
          <Plus className="h-4 w-4" /> Ajouter un témoignage
        </button>
      </div>

      <Toggle label="Afficher la section témoignages" value={v.enabled} onChange={(b) => setV({ ...v, enabled: b })} />
    </Section>
  );
}
