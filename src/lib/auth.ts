import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

const COOKIE_NAME = "silvio_session";
const MAX_AGE_CUSTOMER = 60 * 60 * 24 * 7;  // 7 jours pour les clients
const MAX_AGE_ADMIN    = 60 * 60 * 8;        // 8 heures pour les admins
const MAX_AGE_SECONDS  = MAX_AGE_CUSTOMER;   // défaut fallback

export type SessionUser = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
};

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: { sub: string; role: string }): Promise<string> {
  const age = payload.role === "admin" ? MAX_AGE_ADMIN : MAX_AGE_CUSTOMER;
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + age)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<{ sub: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { sub: String(payload.sub), role: String(payload.role) };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string, role: "admin" | "customer" = "customer") {
  const age = role === "admin" ? MAX_AGE_ADMIN : MAX_AGE_CUSTOMER;
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: age
  });
}

export async function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;

  const rows = await sql<SessionUser[]>`
    select id, email, full_name, phone, role
    from users
    where id = ${payload.sub}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin():
  Promise<{ ok: true; user: SessionUser } | { ok: false; status: number; message: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401, message: "Non authentifié" };
  if (user.role !== "admin") return { ok: false, status: 403, message: "Accès refusé" };
  return { ok: true, user };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
