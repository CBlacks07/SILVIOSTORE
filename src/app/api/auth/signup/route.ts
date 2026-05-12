import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, setSessionCookie, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password, fullName, phone } = await req.json();
    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Informations incomplètes" }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 });
    }

    const normalized = String(email).toLowerCase().trim();
    const existing = await sql`select 1 from users where email = ${normalized} limit 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Cet e-mail est déjà utilisé" }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const rows = await sql<{ id: string; role: string }[]>`
      insert into users (email, password_hash, full_name, phone)
      values (${normalized}, ${password_hash}, ${String(fullName).trim()}, ${phone || null})
      returning id, role
    `;
    const user = rows[0];

    const token = await signSession({ sub: user.id, role: user.role });
    await setSessionCookie(token, "customer");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création du compte" }, { status: 500 });
  }
}
