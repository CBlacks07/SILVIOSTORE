import type { MetadataRoute } from "next";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://silviostore.vercel.app";

  const products = await sql<{ slug: string; updated_at: string }[]>`
    SELECT slug, updated_at FROM products WHERE is_active = true ORDER BY updated_at DESC
  `;

  const categories = await sql<{ slug: string }[]>`
    SELECT slug FROM categories ORDER BY sort_order ASC
  `;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/catalogue`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/livraison`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/cgv`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/retours`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/produit/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/catalogue?categorie=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
