import { randomBytes, createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mailer";

const GENERIC_MESSAGE =
  "Si cet e-mail existe, un lien de réinitialisation a été envoyé.";

async function ensureTable() {
  await sql`
    create table if not exists public.password_reset_tokens (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references public.users(id) on delete cascade,
      token_hash text unique not null,
      expires_at timestamptz not null,
      used_at timestamptz,
      created_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists password_reset_tokens_user_idx on public.password_reset_tokens(user_id)`;
  await sql`create index if not exists password_reset_tokens_expires_idx on public.password_reset_tokens(expires_at)`;
}

export async function POST(req: Request) {
  try {
    await ensureTable();

    const { email } = await req.json();
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) {
      return NextResponse.json({ error: "E-mail requis" }, { status: 400 });
    }

    const users = await sql<{ id: string; full_name: string | null; email: string }[]>`
      select id, full_name, email from users where email = ${normalized} limit 1
    `;
    const user = users[0];

    if (user) {
      const token = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await sql`delete from password_reset_tokens where user_id = ${user.id} and (used_at is null or expires_at < now())`;
      await sql`
        insert into password_reset_tokens (user_id, token_hash, expires_at)
        values (${user.id}, ${tokenHash}, ${expiresAt.toISOString()})
      `;

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://silviostore.com";
      const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${token}`;
      await sendPasswordResetEmail({ to: user.email, fullName: user.full_name, resetUrl });
    }

    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}
