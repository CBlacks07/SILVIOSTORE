import { sql } from "@/lib/db";
import type {
  SiteSettings,
  HeaderStripSettings,
  HomeHeroSettings,
  HomeCtaSettings,
  ShippingSettings,
  FeatureSettings,
  TestimonialsSettings,
  Brand,
  Banner,
  BannerPosition
} from "@/lib/types";

const DEFAULTS = {
  site: {
    name: "SILVIO STORE",
    logo_url: "",
    tagline: "Luxe, tendance et protection réunis.",
    description:
      "La référence des accessoires premium dans la sous région. Pochettes, bracelets Apple, coques et chargeurs de qualité.",
    phone: "+228 92 60 25 19",
    phone2: "+228 98 96 53 44",
    email: "contact@silviostore.com",
    address: "Lomé-Nukafu, Togo",
    currency: "XOF"
  } satisfies SiteSettings,
  header_strip: {
    enabled: true,
    text: "Luxe, tendance et protection — Livraison dans toute la sous région"
  } satisfies HeaderStripSettings,
  home_hero: {
    enabled: true,
    title: "Luxe, tendance et protection réunis.",
    subtitle:
      "La boutique de référence pour les accessoires premium dans la sous région. Livraison rapide, paiement Mobile Money.",
    image_url: "/placeholder-hero.svg",
    images: [],
    slides: [],
    video_url: "",
    badge_text: "SILVIO STORE",
    cta_label: "Découvrir la collection",
    cta_link: "/catalogue",
    cta2_label: "",
    cta2_link: ""
  } satisfies HomeHeroSettings,
  features: {
    enabled: true,
    items: [
      { icon: "Truck", title: "Livraison rapide", text: "Partout dans la sous région" },
      { icon: "ShieldCheck", title: "Authenticité garantie", text: "Produits originaux et sous garantie" },
      { icon: "CreditCard", title: "Paiement sécurisé", text: "Mobile Money et cartes" },
      { icon: "Headset", title: "Conseil personnalisé", text: "Une équipe à votre écoute" }
    ]
  } satisfies FeatureSettings,
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    whatsapp: ""
  },
  footer_links: {
    links: [
      { label: "Livraison", url: "/livraison" },
      { label: "Retours et remboursement", url: "/retours" },
      { label: "Conditions générales", url: "/cgv" },
      { label: "Nous contacter", url: "/contact" }
    ]
  },
  home_cta: {
    enabled: true,
    title: "Votre style mérite le meilleur.",
    text: "Passez en boutique à Lomé ou faites-vous livrer partout dans la sous région. Mobile Money et cartes acceptés.",
    cta_label: "Nous contacter",
    cta_link: "/contact"
  } satisfies HomeCtaSettings,
  testimonials: {
    enabled: true,
    title: "Ils nous font confiance",
    subtitle: "Des clients satisfaits dans toute la sous région.",
    items: [
      { name: "Koffi A.", location: "Lomé, Togo", rating: 5, text: "Qualité irréprochable. Ma coque iPhone est arrivée en 2 jours, exactement comme sur les photos. Je recommande SILVIO STORE à tous mes amis." },
      { name: "Ama S.", location: "Cotonou, Bénin", rating: 5, text: "Le bracelet Apple Watch est magnifique, le cuir est vraiment premium. Paiement Mobile Money simple et livraison rapide. Parfait." },
      { name: "Yves M.", location: "Accra, Ghana", rating: 5, text: "Enfin une boutique sérieuse dans la sous région ! Les produits sont authentiques, le service client très réactif sur WhatsApp." }
    ]
  } satisfies TestimonialsSettings,
  shipping: {
    default_fee: 8000,
    fees: {
      Togo: 1500,
      "Bénin": 5000,
      Ghana: 5000,
      "Burkina Faso": 5000,
      "Côte d'Ivoire": 5000,
      Niger: 6000,
      "Sénégal": 8000,
      Mali: 8000,
      "Guinée": 8000,
      Nigeria: 8000
    } as Record<string, number>
  } satisfies ShippingSettings
};

export type SettingsKey = keyof typeof DEFAULTS;
export type SettingsOf<K extends SettingsKey> = (typeof DEFAULTS)[K];

export async function getSetting<K extends SettingsKey>(key: K): Promise<SettingsOf<K>> {
  try {
    const rows = await sql<{ value: any }[]>`select value from settings where key = ${key} limit 1`;
    // console.log(`RAW_DB_SETTING_${key}:`, JSON.stringify(rows[0]?.value));
    
    if (!rows[0]) return DEFAULTS[key];
    
    let val = rows[0].value;
    if (typeof val === "string") {
      try {
        val = JSON.parse(val);
      } catch {
        // stay as string
      }
    }

    if (val && typeof val === "object" && !Array.isArray(val)) {
      return { ...DEFAULTS[key], ...val } as SettingsOf<K>;
    }
    
    return DEFAULTS[key];
  } catch {
    return DEFAULTS[key];
  }
}

export async function setSetting<K extends SettingsKey>(key: K, value: SettingsOf<K>): Promise<void> {
  await sql`
    insert into settings (key, value, updated_at)
    values (${key}, ${sql.json(value as any)}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

export async function listActiveBrands(): Promise<Brand[]> {
  return sql<Brand[]>`select * from brands where is_active = true order by sort_order asc, name asc`;
}

export async function listAllBrands(): Promise<Brand[]> {
  return sql<Brand[]>`select * from brands order by sort_order asc, name asc`;
}

export async function listActiveBanners(position: BannerPosition): Promise<Banner[]> {
  return sql<Banner[]>`
    select * from banners
    where position = ${position}
      and is_active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    order by sort_order asc, created_at desc
  `;
}

export async function listAllBanners(): Promise<Banner[]> {
  return sql<Banner[]>`select * from banners order by position asc, sort_order asc, created_at desc`;
}

export function computeShippingFee(country: string, shipping: ShippingSettings): number {
  return shipping.fees[country] ?? shipping.default_fee;
}
