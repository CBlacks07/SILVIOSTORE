import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import heicConvert from "heic-convert";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import crypto from "node:crypto";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
// Format par défaut des photos iPhone. Aucun navigateur (hors Safari
// partiellement) ne sait l'afficher — Cloudinary le convertissait avant,
// Vercel Blob stocke le fichier brut tel quel. On le convertit en JPEG
// nous-mêmes plutôt que de rejeter l'upload. Certains navigateurs/OS
// renvoient un type vide pour le HEIC, d'où le repli sur l'extension.
const HEIC_TYPES = ["image/heic", "image/heif"];
function isHeicFile(entry: File): boolean {
  return HEIC_TYPES.includes(entry.type) || /\.hei[cf]$/i.test(entry.name);
}
const IMAGE_MAX = 10 * 1024 * 1024;
const VIDEO_MAX = 100 * 1024 * 1024;
const ALLOWED_FOLDERS = ["products", "banners", "brands", "site"] as const;

// Sur une connexion lente, l'envoi d'une photo de plusieurs Mo peut dépasser
// la limite par défaut des fonctions Vercel avant même d'atteindre Blob.
export const maxDuration = 60;

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

      const heic = kind === "image" && isHeicFile(entry);

      if (!heic && !allowedTypes.includes(entry.type)) {
        return NextResponse.json({ error: "Type de fichier non autorisé : " + entry.type }, { status: 400 });
      }
      if (entry.size > maxSize) {
        return NextResponse.json({ error: "Fichier trop volumineux (max " + maxLabel + ")" }, { status: 400 });
      }

      let uploadBody: File | Buffer = entry;
      let contentType = entry.type || "image/jpeg";
      let ext = entry.name.includes(".") ? entry.name.slice(entry.name.lastIndexOf(".")) : "";

      if (heic) {
        try {
          const inputBuffer = Buffer.from(await entry.arrayBuffer());
          const converted = await heicConvert({ buffer: inputBuffer, format: "JPEG", quality: 0.9 });

          // Certaines photos HEIC (HDR/gain map, rafales, formats propriétaires
          // récents) ne font pas planter la conversion mais produisent un JPEG
          // corrompu — mieux vaut le détecter ici que stocker un fichier mort.
          const isValidJpeg =
            converted.length > 1024 &&
            converted[0] === 0xff && converted[1] === 0xd8 &&
            converted[converted.length - 2] === 0xff && converted[converted.length - 1] === 0xd9;

          if (!isValidJpeg) {
            throw new Error("converted output is not a valid JPEG");
          }

          uploadBody = converted;
          contentType = "image/jpeg";
          ext = ".jpg";
        } catch (convErr) {
          console.error("heic_convert_failed", entry.name, convErr);
          return NextResponse.json(
            {
              error:
                "Cette photo (" + entry.name + ") n'a pas pu être convertie — probablement un format HEIC récent " +
                "(HDR) non pris en charge. Dans Réglages > Appareil photo > Formats sur l'iPhone, choisissez " +
                "\"Le plus compatible\" pour que les prochaines photos soient en JPEG directement.",
            },
            { status: 400 }
          );
        }
      }

      const pathname = `${folder}/${crypto.randomUUID()}${ext}`;

      const blob = await put(pathname, uploadBody, {
        access: "public",
        contentType,
      });

      const fileUrl = blob.url;
      urls.push(fileUrl);

      // Log in media library
      try {
        await sql`
          insert into media (filename, url, type, mime_type, size_bytes, folder)
          values (${entry.name}, ${fileUrl}, ${kind}, ${contentType}, ${entry.size}, ${folder})
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
