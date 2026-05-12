export function sanitizeSiteName(rawName: string) {
  return rawName
    .replace(/\s*[—-]\s*(t[ée]l[ée]phones?|smartphones?)\s*et\s*accessoires?.*$/i, "")
    .replace(/\b(t[ée]l[ée]phones?|smartphones?)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
