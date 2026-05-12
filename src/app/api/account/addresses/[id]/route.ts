import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { Address } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const updated = await sql.begin(async (tx) => {
      const owned = await tx<{ id: string }[]>`
        select id from addresses where id = ${params.id} and user_id = ${user.id} limit 1
      `;
      if (!owned[0]) return null;

      if (wantsDefault) {
        await tx`update addresses set is_default = false where user_id = ${user.id}`;
      }

      const rows = await tx<Address[]>`
        update addresses
        set full_name = ${fullName},
            phone = ${phone},
            country = ${country},
            city = ${city},
            district = ${district},
            details = ${details},
            is_default = ${wantsDefault}
        where id = ${params.id} and user_id = ${user.id}
        returning *
      `;
      return rows[0] || null;
    });

    if (!updated) return NextResponse.json({ error: "Adresse introuvable" }, { status: 404 });
    return NextResponse.json({ ok: true, address: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    await sql.begin(async (tx) => {
      const deleted = await tx<{ id: string; is_default: boolean }[]>`
        delete from addresses
        where id = ${params.id} and user_id = ${user.id}
        returning id, is_default
      `;

      if (!deleted[0]) return;

      if (deleted[0].is_default) {
        const replacement = await tx<{ id: string }[]>`
          select id from addresses
          where user_id = ${user.id}
          order by created_at desc
          limit 1
        `;
        if (replacement[0]) {
          await tx`update addresses set is_default = true where id = ${replacement[0].id}`;
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}
