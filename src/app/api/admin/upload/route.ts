import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const IMAGE_MAX = 5 * 1024 * 1024;
const VIDEO_MAX = 30 * 1024 * 1024;
const ALLOWED_FOLDERS = ["products", "banners", "brands", "site"] as const;

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  try {
    const url = new URL(req.url);
    const folderParam = url.searchParams.get("folder") || "products";
    const folder = (ALLOWED_FOLDERS as readonly string[]).includes(folderParam) ? folderParam : "products";
    const kind = url.searchParams.get("type") === "video" ? "video" : "image";

    const allowedTypes = kind === "video" ? VIDEO_TYPES : IMAGE_TYPES;
    const maxSize = kind === "video" ? VIDEO_MAX : IMAGE_MAX;
    const maxLabel = kind === "video" ? "30 Mo" : "5 Mo";

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

      const ext = entry.name.split(".").pop() || (kind === "video" ? "mp4" : "jpg");
      const filename = randomUUID() + "." + ext.toLowerCase();
      let fileUrl: string;

      if (USE_BLOB) {
        // Production : Vercel Blob
        const blob = await put(`silvio-store/${folder}/${filename}`, entry, {
          access: "public",
          contentType: entry.type,
        });
        fileUrl = blob.url;
      } else {
        // Dev local : filesystem
        const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
        await mkdir(uploadDir, { recursive: true });
        const buffer = Buffer.from(await entry.arrayBuffer());
        await writeFile(path.join(uploadDir, filename), buffer);
        fileUrl = "/uploads/" + folder + "/" + filename;
      }

      urls.push(fileUrl);

      try {
        await sql`
          insert into media (filename, url, type, mime_type, size_bytes, folder)
          values (${entry.name}, ${fileUrl}, ${kind}, ${entry.type}, ${entry.size}, ${folder})
          on conflict (url) do nothing
        `;
      } catch {}
    }

    return NextResponse.json({ urls });
  } catch (e: any) {
    console.error("upload", e);
    return NextResponse.json({ error: e.message || "Erreur d'upload" }, { status: 500 });
  }
}
