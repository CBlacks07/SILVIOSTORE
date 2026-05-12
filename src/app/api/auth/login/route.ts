import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-mail et mot de passe requis" }, { status: 400 });
    }

    const rows = await sql<{ id: string; password_hash: string; role: string }[]>`
      select id, password_hash, role from users where email = ${String(email).toLowerCase().trim()} limit 1
    `;
    const user = rows[0];
    if (!user) return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

    const token = await signSession({ sub: user.id, role: user.role });
    await setSessionCookie(token, user.role as "admin" | "customer");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur de connexion" }, { status: 500 });
  }
}
