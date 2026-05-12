import { sql } from "@/lib/db";
import type { Promotion } from "@/lib/types";

export type PromoResult =
  | { ok: true; promotion: Promotion; discount: number }
  | { ok: false; error: string };

export async function validatePromotion(code: string, subtotal: number): Promise<PromoResult> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { ok: false, error: "Code vide" };

  const rows = await sql<Promotion[]>`select * from promotions where code = ${clean} limit 1`;
  const promo = rows[0];
  if (!promo) return { ok: false, error: "Code inconnu" };
  if (!promo.is_active) return { ok: false, error: "Code désactivé" };

  const now = Date.now();
  if (promo.starts_at && new Date(promo.starts_at).getTime() > now) return { ok: false, error: "Code pas encore actif" };
  if (promo.ends_at && new Date(promo.ends_at).getTime() < now) return { ok: false, error: "Code expiré" };
  if (promo.max_uses != null && promo.used_count >= promo.max_uses) return { ok: false, error: "Code épuisé" };
  if (subtotal < promo.min_order) {
    return { ok: false, error: "Commande minimale : " + promo.min_order.toLocaleString("fr-FR") + " XOF" };
  }

  const raw = promo.discount_type === "percent"
    ? Math.round(subtotal * promo.discount_value / 100)
    : promo.discount_value;
  const discount = Math.min(raw, subtotal);

  return { ok: true, promotion: promo, discount };
}
