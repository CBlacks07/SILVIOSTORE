import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

export function invalidId() {
  return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string = "XOF"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "..." : text;
}

/**
 * Lit une réponse fetch de l'API d'upload en tolérant les réponses non-JSON
 * (page d'erreur Vercel, timeout de fonction sur connexion lente...). Sans
 * ça, res.json() lève une erreur cryptique (ou l'appelant échoue en
 * silence) au lieu d'un message clair pour l'utilisateur.
 */
export async function readUploadResponse(res: Response): Promise<{ urls: string[] }> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // réponse non-JSON — probable timeout ou erreur infra
  }
  if (!res.ok) {
    if (data?.error) throw new Error(data.error);
    if (res.status === 413) {
      throw new Error("Fichier trop volumineux pour être envoyé (limite serveur 4,5 Mo). Essayez une vidéo/photo plus légère.");
    }
    throw new Error(`Échec de l'upload (${res.status}). Réessayez, idéalement avec une meilleure connexion.`);
  }
  return data || { urls: [] };
}
