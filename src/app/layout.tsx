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
import "./globals.css";
import "./typography.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], style: ["normal", "italic"], variable: "--font-playfair" });
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"], variable: "--font-roboto" });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSetting("site");
  const brandName = sanitizeSiteName(site.name) || "SILVIO STORE";
  return {
    title: { default: `${brandName} | Accessoires mobiles`, template: `%s | ${brandName}` },
    description: site.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${roboto.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <AuthSync />
        <PageAnimations />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <MarketingProvider />
      </body>
    </html>
  );
}
