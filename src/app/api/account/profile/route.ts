import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const { fullName, phone, email } = await req.json();

    const nextFullName = String(fullName || "").trim();
    const nextPhone = String(phone || "").trim();
    const nextEmail = String(email || "").trim().toLowerCase();

    if (!nextFullName) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    if (!nextPhone) return NextResponse.json({ error: "Numéro requis" }, { status: 400 });
    if (!nextEmail || !nextEmail.includes("@")) {
      return NextResponse.json({ error: "E-mail invalide" }, { status: 400 });
    }

    const existing = await sql<{ id: string }[]>`
      select id from users where email = ${nextEmail} and id <> ${user.id} limit 1
    `;
    if (existing[0]) {
      return NextResponse.json({ error: "Cet e-mail est déjà utilisé" }, { status: 409 });
    }

    const rows = await sql<{ id: string; full_name: string | null; phone: string | null; email: string; role: "customer" | "admin" }[]>`
      update users
      set full_name = ${nextFullName},
          phone = ${nextPhone},
          email = ${nextEmail}
      where id = ${user.id}
      returning id, full_name, phone, email, role
    `;

    return NextResponse.json({ ok: true, user: rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}
