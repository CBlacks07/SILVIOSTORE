export const dynamic = "force-dynamic";
import Link from "next/link";
import { CheckCircle, Package, Clock, ArrowRight } from "lucide-react";

export const metadata = { title: "Retours et remboursement — SILVIO STORE" };

const CONDITIONS = [
  "Le produit doit être dans son état et emballage d'origine.",
  "Les accessoires (câbles, notices) doivent être inclus.",
  "Le délai de retour est de 7 jours après réception.",
  "Les produits personnalisés ou activés ne sont pas repris.",
];

const STEPS = [
  { icon: Package, step: "01", title: "Initier le retour",   text: "Contactez notre service client avec votre numéro de commande et la raison du retour." },
  { icon: CheckCircle, step: "02", title: "Validation",       text: "Nous vous confirmons la prise en charge et convenons du mode de retour (dépôt ou collecte)." },
  { icon: Clock, step: "03",       title: "Remboursement",    text: "Après inspection du produit, nous procédons au remboursement ou à l'échange sous 5 jours." },
];

export default function ReturnsPage() {
  return (
    <>
      <div className="bg-brand-950 text-white">
        <div className="container-page py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-2 text-xs text-brand-400">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-brand-200">Retours</span>
          </nav>
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight">Retours & remboursement</h1>
          <p className="mt-3 text-brand-300 max-w-xl">
            Vous avez <strong className="text-white">7 jours</strong> après réception pour nous signaler un problème. Nous vous accompagnons à chaque étape.
          </p>
        </div>
      </div>

      <div className="container-page py-14 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-xl font-bold text-brand-950 mb-6">Conditions de retour</h2>
            <ul className="space-y-3">
              {CONDITIONS.map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-accent/10 grid place-items-center">
                    <CheckCircle className="h-3.5 w-3.5 text-accent" />
                  </span>
                  <p className="text-brand-700 text-sm leading-relaxed">{c}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-brand-50 border border-brand-100 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-3">Bon à savoir</p>
            <p className="text-brand-700 text-sm leading-relaxed">
              Pour tout problème de livraison, produit défectueux ou non-conformité, nous prenons en charge l'intégralité du retour sans frais supplémentaires de votre côté.
            </p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors">
              Contacter le SAV <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <h2 className="font-display text-xl font-bold text-brand-950 mt-14 mb-8">La procédure en 3 étapes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-brand-100 bg-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-black text-4xl text-brand-100 leading-none">{s.step}</span>
                <div className="h-10 w-10 rounded-lg bg-accent/10 grid place-items-center text-accent">
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-semibold text-brand-950">{s.title}</h3>
              <p className="mt-2 text-sm text-brand-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
