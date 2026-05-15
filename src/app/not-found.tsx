import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="text-sm font-medium text-accent">Erreur 404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-brand-950">Page introuvable</h1>
      <p className="mt-2 text-brand-600">Le contenu que vous cherchez a été déplacé ou n'existe plus.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">Retour à l'accueil</Link>
    </div>
  );
}
