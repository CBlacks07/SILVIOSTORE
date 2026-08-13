import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import crypto from "node:crypto";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const IMAGE_MAX = 10 * 1024 * 1024;
const VIDEO_MAX = 100 * 1024 * 1024;
const ALLOWED_FOLDERS = ["products", "banners", "brands", "site"] as const;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Configuration Vercel Blob manquante (BLOB_READ_WRITE_TOKEN)" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(req.url);
    const folderParam = url.searchParams.get("folder") || "products";
    const folder = (ALLOWED_FOLDERS as readonly string[]).includes(folderParam) ? folderParam : "products";
    const kind = url.searchParams.get("type") === "video" ? "video" : "image";

    const allowedTypes = kind === "video" ? VIDEO_TYPES : IMAGE_TYPES;
    const maxSize = kind === "video" ? VIDEO_MAX : IMAGE_MAX;
    const maxLabel = kind === "video" ? "100 Mo" : "10 Mo";

    const formData = await req.formData();
    const urls: string[] = [];

    for (const entry of formData.getAll("files")) {
      if (!(entry instanceof File)) continue;

      if (!allowedTypes.includes(entry.type)) {
        return NextResponse.json({ error: "Type de fichier non autorisé : " + entry.type }, { status: 400 });
      }
      if (entry.size > maxSize) {
        return NextResponse.json({ error: "Fichier trop volumineux (max " + maxLabel + ")" }, { status: 400 });
      }

      const ext = entry.name.includes(".") ? entry.name.slice(entry.name.lastIndexOf(".")) : "";
      const pathname = `${folder}/${crypto.randomUUID()}${ext}`;

      const blob = await put(pathname, entry, {
        access: "public",
        contentType: entry.type,
      });

      const fileUrl = blob.url;
      urls.push(fileUrl);

      // Log in media library
      try {
        await sql`
          insert into media (filename, url, type, mime_type, size_bytes, folder)
          values (${entry.name}, ${fileUrl}, ${kind}, ${entry.type}, ${entry.size}, ${folder})
          on conflict (url) do nothing
        `;
      } catch (dbErr) {
        console.warn("Media library log failed", dbErr);
      }
    }

    return NextResponse.json({ urls });
  } catch (e: any) {
    console.error("upload_blob", e);
    return NextResponse.json({ error: e.message || "Erreur d'upload" }, { status: 500 });
  }
}
