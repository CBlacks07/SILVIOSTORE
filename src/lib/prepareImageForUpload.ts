"use client";

// Vercel impose une limite dure de 4,5 Mo sur le corps des requêtes vers ses
// fonctions serveur — non négociable, aucun réglage ne permet de l'augmenter.
// Les photos d'iPhone récents (HEIC haute résolution) dépassent régulièrement
// cette taille selon la scène. On redimensionne/recompresse donc côté
// navigateur avant l'envoi, avec une marge de sécurité sous la limite réelle.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 2400;

function isHeicFile(file: File): boolean {
  return /^image\/hei[cf]$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function resizeToJpeg(source: Blob, maxDim: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  let { width, height } = bitmap;

  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D non disponible");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("La compression de l'image a échoué"))),
      "image/jpeg",
      quality
    );
  });
}

/**
 * Prépare un fichier image pour l'upload : convertit le HEIC/HEIF (photos
 * iPhone) en JPEG, et redimensionne/recompresse tout ce qui dépasse la
 * limite de taille de Vercel. Les vidéos et SVG passent inchangés.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  const heic = isHeicFile(file);

  if (!heic && (!file.type.startsWith("image/") || file.type === "image/svg+xml")) {
    return file;
  }

  let blob: Blob = file;

  if (heic) {
    try {
      const heic2any = (await import("heic2any")).default;
      const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      blob = Array.isArray(result) ? result[0] : result;
    } catch (err) {
      console.error("heic2any_failed", file.name, err);
      throw new Error(
        `Impossible de convertir "${file.name}" (HEIC). Réessayez avec une autre photo, ou changez le format ` +
        `de l'appareil photo dans Réglages > Appareil photo > Formats > "Le plus compatible".`
      );
    }
  }

  // Déjà assez léger et pas de conversion de format nécessaire : on n'y touche pas.
  if (!heic && blob.size <= MAX_UPLOAD_BYTES) {
    return file;
  }

  try {
    let quality = 0.9;
    let out = await resizeToJpeg(blob, MAX_DIMENSION, quality);
    while (out.size > MAX_UPLOAD_BYTES && quality > 0.4) {
      quality -= 0.15;
      out = await resizeToJpeg(blob, MAX_DIMENSION, quality);
    }
    blob = out;
  } catch {
    // Le redimensionnement a échoué (format non supporté par le navigateur,
    // fichier corrompu...) — on envoie ce qu'on a ; la validation serveur
    // renverra une erreur claire si c'est inutilisable.
  }

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
