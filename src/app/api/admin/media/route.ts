import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const url = new URL(req.url);
  const type   = url.searchParams.get("type")   || "";
  const folder = url.searchParams.get("folder") || "";
  const q      = url.searchParams.get("q")      || "";

  const typeCond   = type   ? sql`and type = ${type}`                    : sql``;
  const folderCond = folder ? sql`and folder = ${folder}`                : sql``;
  const qCond      = q      ? sql`and filename ilike ${"%" + q + "%"}`   : sql``;

  const rows = await sql<{
    id: string; filename: string; url: string; type: string;
    mime_type: string | null; size_bytes: number | null; folder: string; created_at: string;
  }[]>`
    select id, filename, url, type, mime_type, size_bytes, folder, created_at
    from media
    where 1=1 ${typeCond} ${folderCond} ${qCond}
    order by created_at desc
    limit 200
  `;

  return NextResponse.json(rows);
}
