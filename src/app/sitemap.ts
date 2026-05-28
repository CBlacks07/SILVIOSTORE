import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://silviostore.com";

  const [products, categories, brands] = await Promise.all([
    sql<{ slug: string; updated_at: string }[]>`
      SELECT slug, updated_at FROM products WHERE is_active = true ORDER BY updated_at DESC
    `,
    sql<{ slug: string }[]>`
      SELECT slug FROM categories ORDER BY sort_order ASC
    `,
    sql<{ slug: string }[]>`
      SELECT slug FROM brands WHERE is_active = true ORDER BY name ASC
    `,
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                          lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/catalogue`,           lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/contact`,             lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/livraison`,           lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/cgv`,                 lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/retours`,             lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/connexion`,           lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/produit/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/catalogue?categorie=${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${base}/catalogue?marque=${b.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...brandPages];
}
