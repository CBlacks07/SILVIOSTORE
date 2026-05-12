import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

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

    const { token, password } = await req.json();
    const rawToken = String(token || "").trim();
    const rawPassword = String(password || "");

    if (!rawToken) return NextResponse.json({ error: "Jeton manquant" }, { status: 400 });
    if (rawPassword.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 8 caractères" }, { status: 400 });
    }

    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const rows = await sql<{ user_id: string }[]>`
      select user_id
      from password_reset_tokens
      where token_hash = ${tokenHash}
        and used_at is null
        and expires_at > now()
      limit 1
    `;

    const record = rows[0];
    if (!record) {
      return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 });
    }

    const nextHash = await hashPassword(rawPassword);

    await sql.begin(async (tx) => {
      await tx`update users set password_hash = ${nextHash} where id = ${record.user_id}`;
      await tx`
        update password_reset_tokens
        set used_at = now()
        where user_id = ${record.user_id}
          and used_at is null
      `;
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur interne" }, { status: 500 });
  }
}
