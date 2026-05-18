import type { Metadata } from "next";
import { Inter, Roboto, Playfair_Display } from "next/font/google";
import { getSetting } from "@/lib/settings";
import { sanitizeSiteName } from "@/lib/siteBrand";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthSync } from "@/components/auth/AuthSync";
import { PageAnimations } from "@/components/layout/PageAnimations";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { MarketingProvider } from "@/components/marketing/MarketingProvider";
import { CompareBar } from "@/components/product/CompareBar";
import "./globals.css";
import "./typography.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], style: ["normal", "italic"], variable: "--font-playfair" });
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], variable: "--font-roboto" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://silviostore.com";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSetting("site");
  const brandName = sanitizeSiteName(site.name) || "SILVIO STORE";
  const logoUrl = `${SITE_URL}/logo-03.png`;

  return {
    title: { default: `${brandName} | Accessoires mobiles`, template: `%s | ${brandName}` },
    description: site.description,
    metadataBase: new URL(SITE_URL),
    manifest: "/manifest.json",
    icons: {
      icon: "/logo-04.png",
      apple: "/logo-04.png",
    },
    openGraph: {
      type: "website",
      siteName: brandName,
      locale: "fr_FR",
      images: [{ url: logoUrl, width: 1200, height: 630, alt: brandName }],
    },
    twitter: {
      card: "summary",
      site: "@silviostore",
      images: [logoUrl],
    },
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SILVIO STORE",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo-03.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/logo-03.png`,
  description: "Accessoires mobiles premium livrés dans toute la sous région. Coques, bracelets Apple Watch, chargeurs, protections écran.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lomé",
    addressCountry: "TG",
    streetAddress: "Nukafu",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+22892602519",
    contactType: "customer service",
    availableLanguage: "French",
  },
  sameAs: [
    `${SITE_URL}`,
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SILVIO STORE",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/catalogue?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${roboto.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <AuthSync />
        <PageAnimations />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <CompareBar />
        <MarketingProvider />
      </body>
    </html>
  );
}
