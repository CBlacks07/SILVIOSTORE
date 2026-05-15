import Link from "next/link";
import { Building2, Package, CreditCard, Truck, Shield, Lock } from "lucide-react";
import { SITE } from "@/lib/constants";

export const metadata = { title: "Conditions générales de vente — SILVIO STORE" };

const SECTIONS = [
  {
    icon: Building2,
    title: "Identification du vendeur",
    content: `${SITE.name}, boutique d'accessoires premium basée à ${SITE.contact.address}. Téléphone : ${SITE.contact.phone}. E-mail : ${SITE.contact.email}.`,
  },
  {
    icon: Package,
    title: "Produits et disponibilité",
    content: "Les produits sont présentés avec la plus grande exactitude possible. La disponibilité est affichée en temps réel. En cas de rupture après commande, nous vous contactons immédiatement.",
  },
  {
    icon: CreditCard,
    title: "Prix et paiement",
    content: "Les prix sont indiqués en francs CFA (XOF), toutes taxes comprises. Le paiement s'effectue via FedaPay : Mobile Money (TMoney, Flooz, MTN, Orange, Moov) ou carte bancaire.",
  },
  {
    icon: Truck,
    title: "Livraison",
    content: "La livraison est assurée dans toute la sous région. Les délais et frais varient selon le pays. Consultez notre page Livraison pour le détail des zones.",
  },
  {
    icon: Shield,
    title: "Garantie et retours",
    content: "Les produits bénéficient des garanties légales et constructeur. Vous disposez de 7 jours après réception pour signaler un problème. Les conditions de retour sont détaillées sur la page dédiée.",
  },
  {
    icon: Lock,
    title: "Données personnelles",
    content: "Les données collectées servent uniquement au traitement des commandes et à la relation client. Elles ne sont jamais cédées à des tiers. Vous pouvez demander leur suppression à tout moment.",
  },
];

export default function TermsPage() {
  return (
    <>
      <div className="bg-brand-950 text-white">
        <div className="container-page py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-2 text-xs text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-brand-200">CGV</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">Conditions générales de vente</h1>
          <p className="mt-3 text-brand-400 text-sm">Dernière mise à jour : mai 2026</p>
        </div>
      </div>

      <div className="container-page py-14 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-5">
          {SECTIONS.map((s, i) => (
            <div key={i} className="rounded-2xl border border-brand-100 bg-white p-6 hover:border-accent/30 hover:shadow-md transition-all duration-200">
              <div className="h-11 w-11 rounded-xl bg-accent/10 grid place-items-center text-accent mb-4">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-brand-950">{s.title}</h3>
              <p className="mt-3 text-sm text-brand-600 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-brand-50 border border-brand-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="flex-1 text-sm text-brand-700">
            Pour toute question relative à ces conditions, contactez-nous directement.
          </p>
          <Link href="/contact" className="btn-primary shrink-0 text-sm">Nous écrire</Link>
        </div>
      </div>
    </>
  );
}
