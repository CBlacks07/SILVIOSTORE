import Link from "next/link";
import { Truck, Clock, CreditCard, MapPin } from "lucide-react";
import { SITE } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Livraison — SILVIO STORE" };

const ZONES = [
  { pays: "Togo",                                                       eta: "1 – 2 jours ouvrés",  cost: 1500,  highlight: true },
  { pays: "Bénin, Ghana, Burkina Faso",                                 eta: "3 – 5 jours ouvrés",  cost: 5000,  highlight: false },
  { pays: "Côte d'Ivoire, Niger, Sénégal, Mali, Guinée, Nigeria",      eta: "5 – 8 jours ouvrés",  cost: 8000,  highlight: false },
];

const INFOS = [
  { icon: Clock,      title: "Préparation",   text: "Commande préparée sous 24 h après validation du paiement." },
  { icon: Truck,      title: "Transporteur",  text: "Livraison confiée à nos partenaires logistiques locaux fiables." },
  { icon: CreditCard, title: "Frais calculés", text: "Les frais exacts sont calculés à la validation du panier." },
  { icon: MapPin,     title: "Suivi",          text: "Un numéro de suivi vous est transmis dès l'expédition." },
];

export default function ShippingPage() {
  return (
    <>
      <div className="bg-brand-950 text-white">
        <div className="container-page py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-2 text-xs text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-brand-200">Livraison</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">Livraison</h1>
          <p className="mt-3 text-brand-300 max-w-xl">
            {SITE.name} livre dans toute la sous région. Paiement Mobile Money ou carte, expédition rapide garantie.
          </p>
        </div>
      </div>

      <div className="container-page py-14 max-w-4xl">
        <h2 className="font-display text-xl font-bold text-brand-950 mb-6">Zones et délais</h2>
        <div className="rounded-2xl border border-brand-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-950 text-white text-left">
                <th className="px-6 py-4 font-semibold">Pays / Zone</th>
                <th className="px-6 py-4 font-semibold">Délai estimé</th>
                <th className="px-6 py-4 font-semibold text-right">Frais</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z, i) => (
                <tr key={z.pays} className={"border-t border-brand-100 " + (i % 2 === 0 ? "bg-white" : "bg-brand-50/40")}>
                  <td className="px-6 py-4 text-brand-900 font-medium">{z.pays}</td>
                  <td className="px-6 py-4 text-brand-600">{z.eta}</td>
                  <td className="px-6 py-4 text-right font-bold text-accent">{formatPrice(z.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {INFOS.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-xl border border-brand-100 bg-white p-5">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-accent/10 grid place-items-center text-accent">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-brand-950 text-sm">{item.title}</p>
                <p className="mt-1 text-xs text-brand-600 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-brand-950 text-white p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="font-bold text-lg">Une question sur votre livraison ?</p>
            <p className="mt-1 text-brand-300 text-sm">Notre équipe répond en moins de 24 h.</p>
          </div>
          <Link href="/contact" className="btn-accent shrink-0">Nous contacter</Link>
        </div>
      </div>
    </>
  );
}
