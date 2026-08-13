import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidUUID, invalidId } from "@/lib/utils";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!isValidUUID(params.id)) return invalidId();

  const rows = await sql<{ url: string }[]>`
    select url from media where id = ${params.id} limit 1
  `;
  if (!rows[0]) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  if (rows[0].url.includes(".public.blob.vercel-storage.com")) {
    try { await del(rows[0].url); } catch (e) { console.warn("Blob delete failed", e); }
  }

  await sql`delete from media where id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
