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
import { CartToast } from "@/components/cart/CartToast";
import "./globals.css";
import "./theme.css";
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
    title: { default: `${brandName} | Coques, pochettes & accessoires téléphone premium`, template: `%s | ${brandName}` },
    description: `${brandName} — Pochettes de luxe, coques originales, accessoires téléphone authentiques. Bracelets Apple Watch, protections écran, chargeurs rapides. Livraison dans toute la sous région. Paiement Mobile Money.`,
    keywords: ["pochette de luxe", "coque téléphone", "pochette originale", "accessoires téléphone originaux", "coque iPhone", "bracelet Apple Watch", "protection écran", "chargeur rapide", "accessoires mobile Togo", "boutique accessoires Lomé", "SILVIO STORE", "accessoires premium sous région"],
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "",
    },
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
  "@type": ["Organization", "LocalBusiness"],
  "@id": `${SITE_URL}/#organization`,
  name: "SILVIO STORE",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    "@id": `${SITE_URL}/#logo`,
    url: `${SITE_URL}/logo-04.png`,
    width: 573,
    height: 537,
    caption: "SILVIO STORE",
  },
  image: `${SITE_URL}/logo-04.png`,
  description: "Boutique en ligne d'accessoires premium pour téléphone au Togo. Pochettes de luxe, coques originales, bracelets Apple Watch, protections écran et chargeurs rapides. Livraison dans toute la sous région. Paiement Mobile Money.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Nukafu",
    addressLocality: "Lomé",
    addressRegion: "Maritime",
    addressCountry: "TG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "6.1319",
    longitude: "1.2228",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+22892602519",
      contactType: "customer service",
      availableLanguage: "French",
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        opens: "08:00",
        closes: "19:00",
      },
    },
  ],
  sameAs: [
    "https://www.facebook.com/silviostore",
    "https://www.instagram.com/silviostore",
  ],
  priceRange: "XOF",
  currenciesAccepted: "XOF",
  paymentAccepted: "Mobile Money, Espèces",
  openingHours: ["Mo-Fr 08:00-19:00", "Sa 09:00-18:00"],
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
        <a href="#main-content" className="skip-to-content">Aller au contenu</a>
        <AuthSync />
        <PageAnimations />
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <CartToast />
        <CompareBar />
        <MarketingProvider />
      </body>
    </html>
  );
}
