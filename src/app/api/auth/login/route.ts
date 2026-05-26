import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";

// In-memory rate limiter: max 5 attempts per IP per 5 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans 5 minutes." },
      { status: 429 }
    );
  }

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
