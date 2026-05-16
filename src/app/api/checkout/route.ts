import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getShippingFor } from "@/lib/shipping";
import { validatePromotion } from "@/lib/promotions";
import { COUNTRY_TO_ISO, createFedaPayCheckout } from "@/lib/fedapay";
import type { CartItem } from "@/lib/types";

const COUNTRY_DIAL_CODE: Record<string, string> = {
  Togo: "+228",
  "Bénin": "+229",
  Benin: "+229",
  Ghana: "+233",
  "Burkina Faso": "+226",
  "Côte d'Ivoire": "+225",
  "Cote d'Ivoire": "+225",
  Niger: "+227",
  "Sénégal": "+221",
  Senegal: "+221",
  Mali: "+223",
  "Guinée": "+224",
  Guinee: "+224",
  Nigeria: "+234"
};

const FEDAPAY_SANDBOX_SUCCESS_NUMBERS = new Set(["64000001", "66000001"]);

function normalizePhone(phone: string, country: string): string | null {
  const compact = String(phone || "").trim().replace(/[^\d+]/g, "");
  if (!compact) return null;
  const isSandbox = (process.env.FEDAPAY_ENVIRONMENT || "sandbox") !== "live";
  const digits = compact.replace(/\D/g, "");

  if (isSandbox && FEDAPAY_SANDBOX_SUCCESS_NUMBERS.has(digits)) {
    return digits;
  }

  if (compact.startsWith("+")) {
    if (!/^\+\d{8,15}$/.test(compact)) return null;
    return compact;
  }

  if (!/^\d{8,12}$/.test(digits)) return null;
  const prefix = COUNTRY_DIAL_CODE[country] || "";
  if (!prefix) return null;
  return prefix + digits;
}

function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return "SLV-" + ts + "-" + rnd;
}

export async function POST(req: Request) {
  try {
    const { form, items, promoCode } = (await req.json()) as {
      form: {
        fullName: string;
        phone: string;
        email: string;
        country: string;
        city: string;
        district: string;
        details: string;
      };
      items: CartItem[];
      promoCode: string;
    };

    if (!items.length) return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    if (!form.fullName || !form.phone || !form.country || !form.city || !form.details) {
      return NextResponse.json({ error: "Informations incomplètes" }, { status: 400 });
    }
    const normalizedPhone = normalizePhone(form.phone, form.country);
    if (!normalizedPhone) {
      const isSandbox = (process.env.FEDAPAY_ENVIRONMENT || "sandbox") !== "live";
      return NextResponse.json(
        {
          error: isSandbox
            ? "Numéro invalide. En mode test FedaPay, utilisez l'opérateur Momo Test avec 64000001 ou 66000001."
            : "Numéro de paiement invalide. Entrez un numéro Mobile Money valide."
        },
        { status: 400 }
      );
    }

    const ids = items.map((i) => i.productId);
    const productResults = await Promise.all(
      ids.map((id) =>
        sql<{ id: string; name: string; price: number; stock: number; is_active: boolean }[]>`
          select id, name, price, stock, is_active from products where id = ${id} limit 1
        `
      )
    );
    const products = productResults.flat().filter(Boolean);

    let subtotal = 0;
    for (const item of items) {
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 50) return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
      const p = products.find((x) => x.id === item.productId);
      if (!p || !p.is_active) return NextResponse.json({ error: "Produit indisponible" }, { status: 400 });
      if (p.stock < qty) return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
      subtotal += p.price * qty;
    }
    if (subtotal <= 0) return NextResponse.json({ error: "Panier vide" }, { status: 400 });

    let discount = 0;
    let appliedCode: string | null = null;
    if (promoCode) {
      const result = await validatePromotion(promoCode, subtotal);
      if (!result.ok) return NextResponse.json({ error: "Code promo : " + result.error }, { status: 400 });
      discount = result.discount;
      appliedCode = result.promotion.code;
    }

    const shipping = await getShippingFor(form.country);
    const total = Math.max(0, subtotal - discount) + shipping.cost;
    const reference = generateReference();
    const user = await getCurrentUser();

    const orderId = await sql.begin(async (tx) => {
      if (user?.id) {
        await tx`
          update orders
          set status = 'cancelled'
          where user_id = ${user.id}
            and status = 'pending'
        `;
      }

      const orderRows = await tx<{ id: string }[]>`
        insert into orders (
          reference, user_id, status, subtotal, shipping_cost, total, discount_amount, promo_code,
          customer_name, customer_phone, customer_email,
          shipping_country, shipping_city, shipping_address, payment_provider
        ) values (
          ${reference}, ${user?.id ?? null}, 'pending', ${subtotal}, ${shipping.cost}, ${total}, ${discount}, ${appliedCode},
          ${form.fullName}, ${normalizedPhone}, ${form.email || null},
          ${form.country}, ${form.city},
          ${[form.district, form.details].filter(Boolean).join(" - ")},
          'fedapay'
        )
        returning id
      `;
      const createdOrderId = orderRows[0].id;

      for (const i of items) {
        const p = products.find((x) => x.id === i.productId)!;
        await tx`
          insert into order_items (order_id, product_id, product_name, unit_price, quantity, variant_label)
          values (${createdOrderId}, ${p.id}, ${p.name}, ${p.price}, ${i.quantity}, ${i.variantLabel || null})
        `;
      }

      if (user?.id) {
        const fullName = form.fullName.trim();
        const phone = normalizedPhone;
        const country = form.country.trim();
        const city = form.city.trim();
        const district = form.district?.trim() || null;
        const details = form.details.trim();

        const existing = await tx<{ id: string }[]>`
          select id
          from addresses
          where user_id = ${user.id}
            and full_name = ${fullName}
            and phone = ${phone}
            and country = ${country}
            and city = ${city}
            and coalesce(district, '') = ${district || ""}
            and details = ${details}
          limit 1
        `;

        const hasDefault = await tx<{ has_default: boolean }[]>`
          select exists(
            select 1 from addresses where user_id = ${user.id} and is_default = true
          ) as has_default
        `;

        if (existing[0]) {
          if (!hasDefault[0]?.has_default) {
            await tx`update addresses set is_default = false where user_id = ${user.id}`;
            await tx`update addresses set is_default = true where id = ${existing[0].id}`;
          }
        } else {
          const makeDefault = !hasDefault[0]?.has_default;
          await tx`
            insert into addresses (user_id, full_name, phone, country, city, district, details, is_default)
            values (${user.id}, ${fullName}, ${phone}, ${country}, ${city}, ${district}, ${details}, ${makeDefault})
          `;
        }
      }

      return createdOrderId;
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const [firstname, ...rest] = form.fullName.trim().split(" ");
    const lastname = rest.join(" ") || firstname;

    const callbackPath = user ? "/compte/commandes" : "/commande/" + reference;
    const isSandbox = (process.env.FEDAPAY_ENVIRONMENT || "sandbox") !== "live";
    const sandboxTestIso =
      isSandbox && FEDAPAY_SANDBOX_SUCCESS_NUMBERS.has(normalizedPhone) ? "bj" : null;

    const fp = await createFedaPayCheckout({
      amount: total,
      description: "Commande " + reference + " - " + items.length + " article(s)",
      reference,
      callbackUrl: siteUrl + callbackPath,
      customer: {
        firstname,
        lastname,
        email: form.email || "no-reply@silviostore.com",
        phone: normalizedPhone,
        countryIso: sandboxTestIso || COUNTRY_TO_ISO[form.country] || "tg"
      }
    });

    await sql`update orders set payment_reference = ${String(fp.transactionId)} where id = ${orderId}`;

    return NextResponse.json({ paymentUrl: fp.paymentUrl, reference });
  } catch (e: any) {
    console.error("checkout error", e);
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}

