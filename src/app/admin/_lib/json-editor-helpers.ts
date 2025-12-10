// app/admin/_components/json-editor-helpers.ts

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * Turn "/hero.png" into "public/hero.png"
 */
export function buildRepoPathFromPublic(publicPath: string): string {
  const trimmed = publicPath.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return `public${trimmed}`;
  return `public/${trimmed}`;
}

/**
 * Normalise a public directory like "leaflets" -> "/leaflets"
 * and "/leaflets/" -> "/leaflets"
 */
export function normalizeDirPublic(
  dir: unknown,
  fallback: string,
): string {
  const raw = typeof dir === "string" ? dir.trim() : "";
  let d = raw || fallback;
  if (!d.startsWith("/")) d = `/${d}`;
  if (d.endsWith("/")) d = d.slice(0, -1);
  return d;
}

/**
 * For "group.leaflet.pages", return "group.leaflet"
 */
export function getBasePath(fieldPath: string): string {
  const parts = fieldPath.split(".");
  parts.pop();
  return parts.join(".");
}
