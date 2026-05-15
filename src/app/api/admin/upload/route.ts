import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import crypto from "node:crypto";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const IMAGE_MAX = 10 * 1024 * 1024; // Cloudinary allows more than 5MB
const VIDEO_MAX = 100 * 1024 * 1024;
const ALLOWED_FOLDERS = ["products", "banners", "brands", "site"] as const;

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary configuration missing (CLOUD_NAME, API_KEY, API_SECRET)" },
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

      const timestamp = Math.round(new Date().getTime() / 1000);
      const publicId = `silvio_${crypto.randomUUID()}`;
      
      // Signature parameters must be in alphabetical order
      // We'll use folder and timestamp and public_id
      const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", entry);
      cloudinaryFormData.append("api_key", apiKey);
      cloudinaryFormData.append("timestamp", timestamp.toString());
      cloudinaryFormData.append("signature", signature);
      cloudinaryFormData.append("folder", folder);
      cloudinaryFormData.append("public_id", publicId);

      const resourceType = kind === "video" ? "video" : "image";
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: cloudinaryFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Cloudinary error:", result);
        throw new Error(result.error?.message || "Cloudinary upload failed");
      }

      const fileUrl = result.secure_url;
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
    console.error("upload_cloudinary", e);
    return NextResponse.json({ error: e.message || "Erreur d'upload" }, { status: 500 });
  }
}
