export function sanitizeRedirect(input: string | null | undefined, fallback = "/compte") {
  if (!input) return fallback;
  const value = input.trim();
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  return value;
}
