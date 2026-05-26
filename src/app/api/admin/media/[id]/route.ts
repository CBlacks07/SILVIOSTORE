import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isValidUUID, invalidId } from "@/lib/utils";
import { unlink } from "node:fs/promises";
import path from "node:path";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  if (!isValidUUID(params.id)) return invalidId();

  const rows = await sql<{ url: string }[]>`
    select url from media where id = ${params.id} limit 1
  `;
  if (!rows[0]) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  const filePath = path.join(process.cwd(), "public", rows[0].url);
  try { await unlink(filePath); } catch {}

  await sql`delete from media where id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
