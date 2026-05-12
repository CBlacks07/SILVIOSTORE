import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { Address } from "@/lib/types";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const body = await req.json();
    const fullName = String(body.full_name || "").trim();
    const phone = String(body.phone || "").trim();
    const country = String(body.country || "").trim();
    const city = String(body.city || "").trim();
    const district = String(body.district || "").trim() || null;
    const details = String(body.details || "").trim();
    const wantsDefault = Boolean(body.is_default);

    if (!fullName || !phone || !country || !city || !details) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const created = await sql.begin(async (tx) => {
      const hasDefault = await tx<{ has_default: boolean }[]>`
        select exists(
          select 1 from addresses where user_id = ${user.id} and is_default = true
        ) as has_default
      `;
      const makeDefault = wantsDefault || !hasDefault[0]?.has_default;

      if (makeDefault) {
        await tx`update addresses set is_default = false where user_id = ${user.id}`;
      }

      const rows = await tx<Address[]>`
        insert into addresses (user_id, full_name, phone, country, city, district, details, is_default)
        values (${user.id}, ${fullName}, ${phone}, ${country}, ${city}, ${district}, ${details}, ${makeDefault})
        returning *
      `;
      return rows[0];
    });

    return NextResponse.json({ ok: true, address: created });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}
