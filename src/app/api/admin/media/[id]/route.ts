import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { del } from "@vercel/blob";
import { unlink } from "node:fs/promises";
import path from "node:path";

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const rows = await sql<{ url: string }[]>`
    select url from media where id = ${params.id} limit 1
  `;
  if (!rows[0]) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  const fileUrl = rows[0].url;
  try {
    if (USE_BLOB && fileUrl.startsWith("https://")) {
      await del(fileUrl);
    } else {
      const filePath = path.join(process.cwd(), "public", fileUrl);
      await unlink(filePath);
    }
  } catch {}

  await sql`delete from media where id = ${params.id}`;
  return NextResponse.json({ ok: true });
}
